(() => {
  const SESSION_KEY = 'etxebusSession';
  const USER_KEY = 'etxebusUser';
  const AUTH_SELECTOR = '[data-auth-role]';
  const GUEST_SELECTOR = '[data-auth-guest]';
  const EVENT_NAME = 'etxebus:auth-change';
  const STYLE_ID = 'etxebus-auth-style';

  function isLoggedIn() {
    return window.localStorage.getItem(SESSION_KEY) === 'authenticated';
  }

  function applyVisibility(loggedIn) {
    const nodes = document.querySelectorAll(AUTH_SELECTOR);
    const guestNodes = document.querySelectorAll(GUEST_SELECTOR);
    nodes.forEach((node) => {
      if (loggedIn) {
        node.removeAttribute('hidden');
        node.setAttribute('aria-hidden', 'false');
      } else {
        node.setAttribute('hidden', '');
        node.setAttribute('aria-hidden', 'true');
      }
    });
    guestNodes.forEach((node) => {
      if (loggedIn) {
        node.setAttribute('hidden', '');
        node.setAttribute('aria-hidden', 'true');
      } else {
        node.removeAttribute('hidden');
        node.setAttribute('aria-hidden', 'false');
      }
    });
  }

  function sanitizeUser(user) {
    if (!user || typeof user !== 'object') return null;
    const id =
      user.idUsuario ??
      user.id_usuario ??
      user.id ??
      null;
    const parsedId = Number(id);
    if (!Number.isFinite(parsedId)) {
      return null;
    }
    const nom = user.nomUsuario || user.nombre || user.username || '';
    const email = user.email || user.usuario || '';
    return {
      idUsuario: parsedId,
      nomUsuario: String(nom || '').trim(),
      email: String(email || '').trim(),
    };
  }

  function getStoredUser() {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (!raw) return null;
      return sanitizeUser(JSON.parse(raw));
    } catch (error) {
      console.warn('No se pudo leer el usuario activo:', error);
      return null;
    }
  }

  function setStoredUser(user) {
    const sanitized = sanitizeUser(user);
    if (sanitized) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(sanitized));
    } else {
      window.localStorage.removeItem(USER_KEY);
    }
    syncAuthUI();
  }

  function dispatchState(loggedIn) {
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { loggedIn, user: getStoredUser() },
      }),
    );
  }

  function syncAuthUI() {
    const loggedIn = isLoggedIn();
    document.documentElement.classList.toggle('etxebus-auth', loggedIn);
    applyVisibility(loggedIn);
    dispatchState(loggedIn);
  }

  function ensureReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function injectAuthStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      html:not(.etxebus-auth) [data-auth-role] {
        display: none !important;
      }
      html.etxebus-auth [data-auth-guest] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  window.EtxebusSession = {
    key: SESSION_KEY,
    isLoggedIn,
    setLoggedIn(state) {
      if (state) {
        window.localStorage.setItem(SESSION_KEY, 'authenticated');
      } else {
        window.localStorage.removeItem(SESSION_KEY);
      }
      syncAuthUI();
    },
    setUser(user) {
      setStoredUser(user);
    },
    getUser() {
      return getStoredUser();
    },
    clearUser() {
      setStoredUser(null);
    },
    subscribe(handler) {
      if (typeof handler !== 'function') return () => {};
      const wrapped = (event) =>
        handler(event.detail || { loggedIn: isLoggedIn(), user: getStoredUser() });
      window.addEventListener(EVENT_NAME, wrapped);
      handler({ loggedIn: isLoggedIn(), user: getStoredUser() });
      return () => window.removeEventListener(EVENT_NAME, wrapped);
    },
  };

  window.addEventListener('storage', (event) => {
    if (event.key === SESSION_KEY || event.key === USER_KEY) {
      syncAuthUI();
    }
  });

  ensureReady(() => {
    injectAuthStyles();
    syncAuthUI();
  });
})();
