(() => {
  const SESSION_KEY = 'etxebusSession';
  const USER_KEY = 'etxebusUser';
  const AUTH_SELECTOR = '[data-auth-role]';
  const EVENT_NAME = 'etxebus:auth-change';
  const STYLE_ID = 'etxebus-auth-style';

  function isLoggedIn() {
    return window.localStorage.getItem(SESSION_KEY) === 'authenticated';
  }

  function applyVisibility(loggedIn) {
    const nodes = document.querySelectorAll(AUTH_SELECTOR);
    nodes.forEach((node) => {
      if (loggedIn) {
        node.removeAttribute('hidden');
        node.setAttribute('aria-hidden', 'false');
      } else {
        node.setAttribute('hidden', '');
        node.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function getStoredUser() {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('No se pudo leer el usuario activo:', error);
      return null;
    }
  }

  function setStoredUser(user) {
    if (user && user.usuario) {
      window.localStorage.setItem(
        USER_KEY,
        JSON.stringify({
          usuario: user.usuario,
          contrasenia: user.contrasenia || '',
        }),
      );
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
