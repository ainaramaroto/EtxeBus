const mongoose = require('mongoose');
const config = require('./config');
const PreferenciaModel = require('./models/preferenciaModel');

async function migrateLegacyPreferencias() {
  const collection = PreferenciaModel.collection;

  await collection.updateMany(
    { origin_slug: { $exists: true }, paradaOrigen: { $exists: false } },
    [{ $set: { paradaOrigen: '$origin_slug' } }]
  );
  await collection.updateMany(
    { destination_slug: { $exists: true }, paradaDestino: { $exists: false } },
    [{ $set: { paradaDestino: '$destination_slug' } }]
  );
  await collection.updateMany(
    { origin_label: { $exists: true }, nomParadaOrigen: { $exists: false } },
    [{ $set: { nomParadaOrigen: '$origin_label' } }]
  );
  await collection.updateMany(
    { destination_label: { $exists: true }, nomParadaDestino: { $exists: false } },
    [{ $set: { nomParadaDestino: '$destination_label' } }]
  );

  await collection.updateMany(
    {
      $or: [
        { origin_slug: { $exists: true } },
        { destination_slug: { $exists: true } },
        { origin_label: { $exists: true } },
        { destination_label: { $exists: true } },
      ],
    },
    {
      $unset: {
        origin_slug: '',
        destination_slug: '',
        origin_label: '',
        destination_label: '',
      },
    }
  );

  try {
    await collection.dropIndex('uniq_usuario_trayecto');
  } catch {
    // Si no existe, no es un error.
  }
}

async function connect() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  mongoose.connection.on('connected', () => {
    console.log('[microservicio-usuarios] Conexion a Mongo establecida');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[microservicio-usuarios] Error en Mongo:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[microservicio-usuarios] Conexion a Mongo cerrada');
  });

  await mongoose.connect(config.mongoUrl, {
    autoIndex: true,
  });

  await migrateLegacyPreferencias();

  return mongoose.connection;
}

module.exports = {
  connect,
};
