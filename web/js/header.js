(() => {
  const API_BASE_URL = window.ETXEBUS_API_BASE || 'http://localhost:4000/api';
  const PRELOAD_STORAGE_KEY = 'etxebusFavoritePreload';
  const STYLE_ID = 'header-favorites-style';
  const INFO_TITLE = 'EtxeBus - Servicio de Transporte Urbano Municipal';
  const INFO_PARAGRAPHS = [
    'Desde 2005, Etxebarri cuenta con el EtxebarriBus, un Servicio de Transporte Urbano financiado y gestionado por el Ayuntamiento de Etxebarri. Permite acceder de modo fácil y rápido a la estación de Metro. Además de ser una “lanzadera” hacia el Metro permite la conexión con los servicios del municipio: Metro, Estación de Euskotren, Colegios, Instituto, Centro de Salud y Polideportivo...',
    'La Línea 1 une la estación de Metro con San Esteban, Kukullaga y San Antonio. La Línea 2 permite acceder al Polígono Legizamon y al barrio del Boquete.',
    'El Etxebarribus está acogido al sistema Creditrans-Barik por lo que goza de descuentos en su uso combinado con el Metro. Desde su puesta en marcha el número de usuarios ha ido aumentando paulatinamente, así como su grado de satisfacción siendo hoy día un servicio imprescindible además de emblemático en Etxebarri.',
    'El Servicio se dota de una Ordenanza que establece y adecúa los usos del EtxebarriBus a las demandas de las personas usuarias.',
  ];
  const INFO_LINKS = [
    {
      label: 'Precio',
      href: '../docs/etxebarri-precio.pdf',
    },
    {
      label: 'Ordenanza',
      href: '../docs/etxebarri-ordenanza.pdf',
    },
    {
      label: 'Seguridad',
      href: '../docs/etxebarri-seguridad.pdf',
    },
  ];

  let overlayEl;
  let overlayList;
  let favorites = [];
  let isLoggedIn = false;
  let overlayInitialized = false;
  let infoFabEl;
  let infoPanelEl;
  let infoInitialized = false;
  let infoBackdropEl;
  let docOverlayEl;
  let docIframeEl;
  let docTitleEl;

  function openDocOverlay(docUrl, docTitle) {
    if (!docUrl || !docOverlayEl || !docIframeEl) return;
    docIframeEl.src = docUrl;
    if (docTitleEl) {
      docTitleEl.textContent = docTitle || 'Documento';
    }
    docOverlayEl.removeAttribute('hidden');
    docOverlayEl.setAttribute('aria-hidden', 'false');
  }

  function closeDocOverlay() {
    if (!docOverlayEl) return;
    docOverlayEl.setAttribute('hidden', '');
    docOverlayEl.setAttribute('aria-hidden', 'true');
    if (docIframeEl) {
      docIframeEl.src = '';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    initInfoOverlay();

    const trigger = document.querySelector('[data-role="header-favorites"]');
    if (trigger) {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        toggleOverlay();
      });
      trackAuthState();
    }
  });

  function trackAuthState() {
    if (window.EtxebusSession && typeof window.EtxebusSession.subscribe === 'function') {
      window.EtxebusSession.subscribe(({ loggedIn }) => {
        isLoggedIn = Boolean(loggedIn);
        if (!isLoggedIn) {
          favorites = [];
          renderOverlay();
          hideOverlay();
        }
      });
    } else {
      isLoggedIn = window.localStorage.getItem('etxebusSession') === 'authenticated';
    }
  }

  function toggleOverlay(force) {
    ensureOverlay();
    const shouldShow =
      typeof force === 'boolean' ? force : overlayEl.hasAttribute('hidden');
    if (shouldShow) {
      overlayEl.removeAttribute('hidden');
      overlayEl.setAttribute('aria-hidden', 'false');
      refreshOverlayFavorites();
    } else {
      hideOverlay();
    }
  }

  function hideOverlay() {
    if (!overlayEl) return;
    overlayEl.setAttribute('hidden', '');
    overlayEl.setAttribute('aria-hidden', 'true');
  }

  function ensureOverlay() {
    if (overlayInitialized) return;
    overlayInitialized = true;
    overlayEl = document.createElement('div');
    overlayEl.className = 'header-favorites-overlay';
    overlayEl.setAttribute('hidden', '');
    overlayEl.setAttribute('aria-hidden', 'true');
    overlayEl.innerHTML = `
      <div class="hf-card" role="dialog" aria-modal="true" aria-label="Trayectos favoritos">
        <div class="hf-card__header">
          <div>
            <p class="hf-eyebrow">Favoritos</p>
            <h3>Tus trayectos guardados</h3>
          </div>
          <button type="button" class="hf-close" data-action="close" aria-label="Cerrar favoritos">&times;</button>
        </div>
        <div class="hf-card__body">
          <div class="hf-list"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlayEl);
    overlayList = overlayEl.querySelector('.hf-list');
    overlayEl.addEventListener('click', (event) => {
      if (event.target === overlayEl) {
        hideOverlay();
      }
    });
    overlayEl.addEventListener('click', handleOverlayAction);
  }

  async function refreshOverlayFavorites() {
    if (!isLoggedIn) {
      favorites = [];
      renderOverlay();
      return;
    }
    const credentials = getCurrentUserCredentials();
    if (!credentials || !credentials.idUsuario) {
      favorites = [];
      renderOverlay();
      return;
    }
    try {
      const params = new URLSearchParams({
        idUsuario: credentials.idUsuario,
      });
      const response = await fetch(`${API_BASE_URL}/favoritos?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json();
      favorites = payload.data || [];
    } catch (error) {
      console.warn('No se pudieron cargar los favoritos:', error);
      favorites = [];
    }
    renderOverlay();
  }

  function renderOverlay() {
    if (!overlayList) return;
    if (!isLoggedIn) {
      overlayList.innerHTML =
        '<p class="hf-empty">Inicia sesi&oacute;n para consultar tus trayectos favoritos.</p>';
      return;
    }
    if (!favorites.length) {
      overlayList.innerHTML = '<p class="hf-empty">A&uacute;n no tienes trayectos guardados.</p>';
      return;
    }
    overlayList.innerHTML = favorites
      .map(
        (fav) => `
        <article class="hf-item">
          <div class="hf-item__route">
            <span>${fav.origin_label}</span>
            <span>→</span>
            <span>${fav.destination_label}</span>
          </div>
          <div class="hf-item__actions">
            <button type="button" data-action="apply" data-origin="${fav.origin_slug}" data-destination="${fav.destination_slug}">Cargar</button>
            <button type="button" data-action="remove" data-favorite-id="${fav.idFavorito}">Eliminar</button>
          </div>
        </article>
      `,
      )
      .join('');
  }

  function handleOverlayAction(event) {
    const closeButton = event.target.closest('[data-action="close"]');
    if (closeButton) {
      hideOverlay();
      return;
    }
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'apply') {
      const originSlug = button.dataset.origin;
      const destinationSlug = button.dataset.destination;
      hideOverlay();
      navigateToTrayecto(originSlug, destinationSlug);
      return;
    }
    if (action === 'remove') {
      removeFavorite(button.dataset.favoriteId);
    }
  }

  async function removeFavorite(favoriteId) {
    if (!favoriteId) return;
    const credentials = getCurrentUserCredentials();
    if (!credentials || !credentials.idUsuario) return;
    try {
      const params = new URLSearchParams({
        idUsuario: credentials.idUsuario,
      });
      const response = await fetch(
        `${API_BASE_URL}/favoritos/${favoriteId}?${params.toString()}`,
        { method: 'DELETE' },
      );
      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP ${response.status}`);
      }
      await refreshOverlayFavorites();
    } catch (error) {
      console.warn('No se pudo eliminar el favorito', error);
    }
  }

  function navigateToTrayecto(originSlug, destinationSlug) {
    if (!originSlug || !destinationSlug) return;
    try {
      window.sessionStorage.setItem(
        PRELOAD_STORAGE_KEY,
        JSON.stringify({ origin: originSlug, destination: destinationSlug }),
      );
    } catch (error) {
      console.warn('No se pudo preparar el trayecto favorito seleccionado.', error);
    }
    const basePath = window.location.pathname;
    const cutIndex = basePath.lastIndexOf('/');
    const baseDir = cutIndex >= 0 ? basePath.substring(0, cutIndex + 1) : './';
    window.location.href = `${baseDir}trayecto.html`;
  }

  function getCurrentUserCredentials() {
    const normalize = (user) => {
      if (!user || typeof user !== 'object') return null;
      const id = Number(user.idUsuario ?? user.id);
      if (!Number.isFinite(id)) return null;
      return {
        idUsuario: id,
        nomUsuario: user.nomUsuario || '',
        email: user.email || '',
      };
    };

    if (window.EtxebusSession && typeof window.EtxebusSession.getUser === 'function') {
      return normalize(window.EtxebusSession.getUser());
    }
    try {
      const raw = window.localStorage.getItem('etxebusUser');
      return raw ? normalize(JSON.parse(raw)) : null;
    } catch (error) {
      console.warn('No se pudo leer el usuario almacenado', error);
      return null;
    }
  }

  function initInfoOverlay() {
    if (infoInitialized) return;
    infoInitialized = true;
    infoFabEl = document.createElement('button');
    infoFabEl.type = 'button';
    infoFabEl.className = 'info-fab';
    infoFabEl.setAttribute('aria-label', 'Informacion sobre el servicio EtxeBus');
    infoFabEl.setAttribute('aria-expanded', 'false');
    infoFabEl.innerHTML = '<span>i</span>';

    infoBackdropEl = document.createElement('div');
    infoBackdropEl.className = 'info-backdrop';
    infoBackdropEl.setAttribute('hidden', '');
    infoBackdropEl.setAttribute('aria-hidden', 'true');

    infoPanelEl = document.createElement('section');
    infoPanelEl.className = 'info-panel';
    infoPanelEl.setAttribute('aria-hidden', 'true');
    infoPanelEl.setAttribute('hidden', '');

    const paragraphs = INFO_PARAGRAPHS.map((text) => `<p>${text}</p>`).join('');
    const links = INFO_LINKS.map(
      (link) =>
        `<li><a href="${link.href}" target="_blank" rel="noreferrer noopener">${link.label}</a></li>`,
    ).join('');

    infoPanelEl.innerHTML = `
      <div class="info-panel__header">
        <h3>${INFO_TITLE}</h3>
        <button type="button" class="info-panel__close" aria-label="Cerrar informacion">&times;</button>
      </div>
      <div class="info-panel__body">
        ${paragraphs}
        <div class="info-panel__links">
          ${INFO_LINKS.map(
            (link) => `
              <div class="info-link-row">
                <span>${link.label}</span>
                <div>
                  <button type="button" class="info-link-open" data-info-doc="${link.href}" data-info-title="${link.label}">
                    Abrir
                  </button>
                </div>
              </div>
            `,
          ).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(infoFabEl);
    document.body.appendChild(infoBackdropEl);
    document.body.appendChild(infoPanelEl);

    docOverlayEl = document.createElement('div');
    docOverlayEl.className = 'info-doc-overlay';
    docOverlayEl.setAttribute('hidden', '');
    docOverlayEl.setAttribute('aria-hidden', 'true');
    docOverlayEl.innerHTML = `
      <div class="info-doc-card" role="dialog" aria-modal="true">
        <div class="info-doc-header">
          <strong data-info-doc-title>Documento</strong>
          <button type="button" class="info-doc-close" aria-label="Cerrar documento">&times;</button>
        </div>
        <iframe title="Documento" loading="lazy"></iframe>
      </div>
    `;
    document.body.appendChild(docOverlayEl);
    docIframeEl = docOverlayEl.querySelector('iframe');
    docTitleEl = docOverlayEl.querySelector('[data-info-doc-title]');

    const closeButton = infoPanelEl.querySelector('.info-panel__close');
    if (closeButton) {
      closeButton.addEventListener('click', () => toggleInfoOverlay(false));
    }
    infoFabEl.addEventListener('click', () => toggleInfoOverlay());
    infoBackdropEl.addEventListener('click', () => toggleInfoOverlay(false));
    document.addEventListener('click', (event) => {
      if (!infoPanelEl || infoPanelEl.hasAttribute('hidden')) return;
      if (
        infoPanelEl.contains(event.target) ||
        (infoFabEl && infoFabEl.contains(event.target))
      ) {
        return;
      }
      toggleInfoOverlay(false);
    });

    infoPanelEl.addEventListener('click', (event) => {
      const openButton = event.target.closest('.info-link-open');
      if (!openButton) return;
      event.preventDefault();
      openDocOverlay(openButton.dataset.infoDoc, openButton.dataset.infoTitle);
    });

    if (docOverlayEl) {
      docOverlayEl.addEventListener('click', (event) => {
        if (event.target === docOverlayEl || event.target.closest('.info-doc-close')) {
          closeDocOverlay();
        }
      });
    }
    document.addEventListener('keydown', handleInfoKeydown);
  }

  function handleInfoKeydown(event) {
    if (event.key !== 'Escape') return;
    if (docOverlayEl && !docOverlayEl.hasAttribute('hidden')) {
      event.preventDefault();
      closeDocOverlay();
      return;
    }
    if (!infoPanelEl || infoPanelEl.hasAttribute('hidden')) return;
    event.preventDefault();
    toggleInfoOverlay(false);
  }

  function toggleInfoOverlay(force) {
    if (!infoPanelEl || !infoFabEl) return;
    const shouldShow =
      typeof force === 'boolean' ? force : infoPanelEl.hasAttribute('hidden');
    if (shouldShow) {
      infoPanelEl.removeAttribute('hidden');
      infoPanelEl.setAttribute('aria-hidden', 'false');
      infoFabEl.setAttribute('aria-expanded', 'true');
      if (infoBackdropEl) {
        infoBackdropEl.removeAttribute('hidden');
        infoBackdropEl.setAttribute('aria-hidden', 'false');
      }
    } else {
      closeDocOverlay();
      infoPanelEl.setAttribute('hidden', '');
      infoPanelEl.setAttribute('aria-hidden', 'true');
      infoFabEl.setAttribute('aria-expanded', 'false');
      if (infoBackdropEl) {
        infoBackdropEl.setAttribute('hidden', '');
        infoBackdropEl.setAttribute('aria-hidden', 'true');
      }
      const linksSection = infoPanelEl.querySelector('[data-info-section="list"]');
      const viewerSection = infoPanelEl.querySelector('[data-info-section="viewer"]');
      const viewerFrame = viewerSection?.querySelector('iframe');
      if (viewerSection && linksSection) {
        viewerSection.setAttribute('hidden', '');
        linksSection.removeAttribute('hidden');
      }
      if (viewerFrame) {
        viewerFrame.src = '';
      }
    }
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .header-favorites-overlay {
        position: fixed;
        inset: 0;
        background: rgba(7, 21, 40, 0.45);
        display: flex;
        justify-content: flex-end;
        align-items: flex-start;
        padding: 5rem clamp(1rem, 5vw, 3rem) 2rem;
        z-index: 120;
      }
      .header-favorites-overlay[hidden] {
        display: none;
      }
      .hf-card {
        width: min(380px, calc(100% - 2rem));
        background: #fff;
        border-radius: 24px;
        padding: 1.25rem 1.5rem;
        box-shadow: 0 25px 55px rgba(6, 22, 52, 0.25);
        border: 1px solid rgba(15, 30, 60, 0.08);
      }
      .hf-card__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }
      .hf-card__header h3 {
        margin: 0.25rem 0 0;
      }
      .hf-eyebrow {
        margin: 0;
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.08em;
        color: #5b6b85;
      }
      .hf-close {
        border: none;
        background: #f3f6ff;
        width: 36px;
        height: 36px;
        border-radius: 14px;
        font-size: 1.4rem;
        cursor: pointer;
        color: #325a8d;
      }
      .hf-card__body {
        margin-top: 0.75rem;
        max-height: 60vh;
        overflow-y: auto;
        padding-right: 0.25rem;
      }
      .hf-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .hf-item {
        border: 1px solid rgba(15, 30, 60, 0.1);
        border-radius: 16px;
        padding: 0.75rem 0.9rem;
        background: #f6f9ff;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
      }
      .hf-item__route {
        font-weight: 600;
        color: #0f5f97;
        display: flex;
        align-items: center;
        gap: 0.35rem;
        flex-wrap: wrap;
      }
      .hf-item__actions {
        display: flex;
        gap: 0.5rem;
      }
      .hf-item__actions button {
        flex: 1;
        border: none;
        border-radius: 14px;
        padding: 0.45rem 0.5rem;
        font-weight: 600;
        cursor: pointer;
      }
      .hf-item__actions button[data-action="apply"] {
        background: #0f5f97;
        color: #fff;
      }
      .hf-item__actions button[data-action="remove"] {
        background: #ffe9e9;
        color: #8a1c1c;
      }
      .hf-empty {
        margin: 1rem 0;
        color: #5b6b85;
        text-align: center;
        font-style: italic;
      }
      .info-fab {
        position: fixed;
        left: clamp(0.5rem, 3vw, 1rem);
        bottom: clamp(0.5rem, 3vw, 1rem);
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 3px solid #fff;
        background: #0f5f97;
        color: #fff;
        font-size: 1.6rem;
        font-weight: 700;
        box-shadow: 0 20px 45px rgba(15, 95, 151, 0.4);
        cursor: pointer;
        z-index: 80;
      }
      .info-fab span {
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      }
      .info-panel {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: min(720px, calc(100% - 2rem));
        background: #ffffff;
        border-radius: 22px;
        border: 1px solid rgba(15, 30, 60, 0.12);
        box-shadow: 0 30px 55px rgba(6, 22, 52, 0.25);
        padding: 1.35rem 1.45rem;
        z-index: 85;
      }
      .info-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(8, 20, 40, 0.35);
        z-index: 80;
      }
      .info-backdrop[hidden] {
        display: none;
      }
      @media (max-width: 720px) {
        .info-panel {
          top: auto;
          transform: none;
          bottom: calc(clamp(0.5rem, 3vw, 1.5rem) + 80px);
        }
      }
      .info-panel[hidden] {
        display: none;
      }
      .info-panel__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.75rem;
      }
      .info-panel__header h3 {
        margin: 0;
        font-size: 1rem;
        color: #0f5f97;
      }
      .info-panel__close {
        border: none;
        background: #f0f5ff;
        color: #0f5f97;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        font-size: 1.4rem;
        cursor: pointer;
      }
      .info-panel__body p {
        margin: 0 0 0.75rem;
        color: #4b6075;
        line-height: 1.4;
      }
      .info-panel__links {
        margin: 0.75rem 0 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .info-link-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid rgba(15, 30, 60, 0.1);
        border-radius: 14px;
        padding: 0.5rem 0.75rem;
        gap: 0.5rem;
      }
      .info-link-row span {
        font-weight: 600;
        color: #0f5f97;
      }
      .info-link-row button {
        text-decoration: none;
        border: none;
        background: #0f5f97;
        color: #fff;
        font-weight: 600;
        border-radius: 12px;
        padding: 0.35rem 0.75rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
      }
      .info-doc-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: clamp(0.75rem, 4vw, 2rem);
        background: rgba(5, 15, 30, 0.65);
        z-index: 140;
      }
      .info-doc-overlay[hidden] {
        display: none;
      }
      .info-doc-card {
        width: min(960px, calc(100% - 1rem));
        height: min(85vh, 720px);
        border-radius: 20px;
        background: #ffffff;
        box-shadow: 0 25px 60px rgba(6, 22, 52, 0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(15, 30, 60, 0.14);
      }
      .info-doc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.85rem 1.15rem;
        background: #f6f9ff;
        border-bottom: 1px solid rgba(15, 30, 60, 0.1);
        gap: 0.75rem;
      }
      .info-doc-header strong {
        color: #0f5f97;
        font-size: 1rem;
      }
      .info-doc-close {
        border: none;
        background: #0f5f97;
        color: #fff;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        font-size: 1.3rem;
        cursor: pointer;
      }
      .info-doc-card iframe {
        flex: 1;
        width: 100%;
        border: none;
        background: #fff;
      }
      .info-panel__viewer {
        margin-top: 0.75rem;
        border: 1px solid rgba(15, 30, 60, 0.1);
        border-radius: 16px;
        background: #f6f9ff;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .info-viewer__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .info-viewer__back {
        border: none;
        background: #0f5f97;
        color: #fff;
        border-radius: 12px;
        padding: 0.35rem 0.75rem;
        cursor: pointer;
        font-weight: 600;
      }
      .info-panel__viewer iframe {
        width: 100%;
        height: 360px;
        border: none;
        border-radius: 12px;
        background: #fff;
      }
      }
    `;
    document.head.appendChild(style);
  }
})();
