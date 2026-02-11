const axios = require('axios');
const JSZip = require('jszip');
const Papa = require('papaparse');

const GTFS_URL = 'https://cms.metrobilbao.eus/get/open_data/horarios/es';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos: el feed GTFS no cambia a menudo
const TARGET_STOP_MATCHER = /etxebarri/i;
const EXCLUDE_HEADSIGN = /etxebarri/i;
const MINUTES_PER_DAY = 24 * 60;
const REMOTE_TIMEOUT_MS = 25000;

let cache = {
  lastLoaded: 0,
  departures: [],
  tripsById: new Map(),
  calendar: [],
  calendarDates: [],
  stopIds: [],
};

async function ensureGtfsLoaded(force = false) {
  const now = Date.now();
  if (!force && cache.lastLoaded && now - cache.lastLoaded < CACHE_TTL_MS && cache.departures.length) {
    return;
  }

  let response;
  try {
    response = await axios.get(GTFS_URL, {
      responseType: 'arraybuffer',
      timeout: REMOTE_TIMEOUT_MS,
    });
  } catch (error) {
    if (cache.departures.length) {
      console.warn('[metroService] Error actualizando feed, usando cache anterior:', error.message);
      cache.lastLoaded = Date.now();
      return;
    }
    throw error;
  }
  const zip = await JSZip.loadAsync(response.data);

  const [stopsTxt, tripsTxt, stopTimesTxt, calendarTxt, calendarDatesTxt] = await Promise.all([
    zip.file('stops.txt').async('string'),
    zip.file('trips.txt').async('string'),
    zip.file('stop_times.txt').async('string'),
    zip.file('calendar.txt').async('string'),
    zip.file('calendar_dates.txt').async('string'),
  ]);

  const stops = parseCsv(stopsTxt);
  const targetStops = stops.filter((stop) => TARGET_STOP_MATCHER.test(stop.stop_name || ''));
  const targetStopIds = new Set(targetStops.map((stop) => stop.stop_id));

  const trips = parseCsv(tripsTxt);
  const tripsById = new Map();
  trips.forEach((trip) => {
    if (!trip.trip_id) return;
    tripsById.set(trip.trip_id, {
      headsign: (trip.trip_headsign || '').trim(),
      serviceId: trip.service_id,
      routeId: trip.route_id,
    });
  });

  const calendar = parseCsv(calendarTxt);
  const calendarDates = parseCsv(calendarDatesTxt);

  const stopTimes = parseCsv(stopTimesTxt);
  const departures = stopTimes
    .filter((row) => targetStopIds.has(row.stop_id))
    .map((row) => {
      const trip = tripsById.get(row.trip_id);
      if (!trip) return null;
      const departureMinutes = parseTimeToMinutes(row.departure_time);
      if (!Number.isFinite(departureMinutes)) return null;
      return {
        tripId: row.trip_id,
        stopId: row.stop_id,
        departureMinutes,
        headsign: trip.headsign || 'Destino no disponible',
        serviceId: trip.serviceId,
        routeId: trip.routeId,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.departureMinutes - b.departureMinutes);

  cache = {
    lastLoaded: now,
    departures,
    tripsById,
    calendar,
    calendarDates,
    stopIds: Array.from(targetStopIds),
  };
}

function parseCsv(text) {
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  return Array.isArray(result.data) ? result.data : [];
}

function parseTimeToMinutes(value) {
  if (!value) return Number.NaN;
  const [rawHour, rawMinute] = value.split(':');
  const hour = Number.parseInt(rawHour, 10);
  const minute = Number.parseInt(rawMinute, 10);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return Number.NaN;
  return hour * 60 + minute;
}

function formatClock(totalMinutes) {
  const normalized = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function minutesUntil(targetMinutes, nowMinutes) {
  const diff = targetMinutes - nowMinutes;
  return diff >= 0 ? diff : diff + MINUTES_PER_DAY;
}

function buildActiveServiceSet(referenceDate = new Date()) {
  const weekdayColumns = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const weekdayKey = weekdayColumns[referenceDate.getDay()];
  const ymd = toYmd(referenceDate);
  const current = Number(ymd);
  const active = new Set();

  cache.calendar.forEach((row) => {
    if (!row || !row.service_id) return;
    const start = Number(row.start_date);
    const end = Number(row.end_date);
    if (Number.isFinite(start) && Number.isFinite(end) && (current < start || current > end)) {
      return;
    }
    if (String(row[weekdayKey]) === '1') {
      active.add(row.service_id);
    }
  });

  cache.calendarDates.forEach((row) => {
    if (!row || String(row.date) !== ymd || !row.service_id) return;
    if (String(row.exception_type) === '1') active.add(row.service_id);
    if (String(row.exception_type) === '2') active.delete(row.service_id);
  });

  return active;
}

function toYmd(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

async function getUpcomingDepartures({ limit = 5, at, tzOffsetMinutes } = {}) {
  await ensureGtfsLoaded();

  const { referenceDate, referenceMinutes } = buildReferenceContext(at, tzOffsetMinutes);
  const activeServiceIds = buildActiveServiceSet(referenceDate);

  const candidates = cache.departures.filter((item) => {
    const allowedService = activeServiceIds.size ? activeServiceIds.has(item.serviceId) : true;
    const validHeadsign = !EXCLUDE_HEADSIGN.test(item.headsign || '');
    return allowedService && validHeadsign;
  });

  if (!candidates.length) {
    return {
      station: 'Metro Etxebarri',
      generatedAt: now.toISOString(),
      departures: [],
      stopIds: cache.stopIds,
    };
  }

  const sameDay = candidates.filter((item) => item.departureMinutes >= referenceMinutes);
  const nextDepartures = [...sameDay, ...candidates.filter((item) => item.departureMinutes < referenceMinutes)].slice(
    0,
    limit
  );

  return {
    station: 'Metro Etxebarri',
    generatedAt: referenceDate.toISOString(),
    stopIds: cache.stopIds,
    departures: nextDepartures.map((item) => ({
      time: formatClock(item.departureMinutes),
      destination: item.headsign,
      tripId: item.tripId,
      serviceId: item.serviceId,
      stopId: item.stopId,
      minutesUntil: minutesUntil(item.departureMinutes, referenceMinutes),
    })),
  };
}

function buildReferenceDate(value) {
  if (!value) return new Date();
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

function buildReferenceContext(at, tzOffsetMinutes) {
  const referenceDate = buildReferenceDate(at);
  const offset = Number.isFinite(tzOffsetMinutes) ? tzOffsetMinutes : referenceDate.getTimezoneOffset();
  const utcMinutes = referenceDate.getUTCHours() * 60 + referenceDate.getUTCMinutes();
  const referenceMinutes = utcMinutes - offset;
  // Ajustamos fecha para determinar el tipo de día usando la hora local de referencia
  const adjustedDate = new Date(referenceDate.getTime() - offset * 60000);
  return { referenceDate: adjustedDate, referenceMinutes };
}

module.exports = {
  getUpcomingDepartures,
  // expuesto para tests o recarga manual
  __private: {
    ensureGtfsLoaded,
  },
};
