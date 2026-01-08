const API_BASE_URL = window.ETXEBUS_API_BASE || 'http://localhost:4000/api';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const registerButton = document.getElementById('register-button');
  const skipButton = document.getElementById('skip-login');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const toggleButtons = document.querySelectorAll('[data-password-toggle]');
  const errorBox = document.getElementById('login-error');

  function showError(message) {
    if (!errorBox) return;
    errorBox.textContent = message || '';
  }

  function persistLogin(user) {
    const payload = {
      idUsuario: user.idUsuario,
      nomUsuario: user.nomUsuario,
      email: user.email,
    };
    if (window.EtxebusSession) {
      window.EtxebusSession.setUser(payload);
      window.EtxebusSession.setLoggedIn(true);
    } else {
      window.localStorage.setItem('etxebusSession', 'authenticated');
      window.localStorage.setItem('etxebusUser', JSON.stringify(payload));
    }
  }

  function clearLogin() {
    if (window.EtxebusSession) {
      window.EtxebusSession.clearUser();
      window.EtxebusSession.setLoggedIn(false);
    } else {
      window.localStorage.removeItem('etxebusSession');
      window.localStorage.removeItem('etxebusUser');
    }
  }

  async function authenticate(identifier, contrasenia) {
    const normalized = String(identifier || '').trim();
    const payload = { contrasenia };
    if (normalized.includes('@')) {
      payload.email = normalized.toLowerCase();
    } else {
      payload.usuario = normalized;
    }

    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    let responseBody = null;
    try {
      responseBody = await response.json();
    } catch (error) {
      responseBody = null;
    }
    if (!response.ok) {
      const fallback =
        response.status === 401 ? 'Credenciales invalidas' : `HTTP ${response.status}`;
      throw new Error(responseBody?.message || fallback);
    }
    return responseBody?.data || null;
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      showError('');
      const identifier = emailInput?.value?.trim();
      const contrasenia = passwordInput?.value || '';
      if (!identifier || !contrasenia) {
        showError('Debes completar tu usuario/email y contrasena.');
        return;
      }
      try {
        const user = await authenticate(identifier, contrasenia);
        if (!user || !user.idUsuario) {
          throw new Error('Respuesta invalida del servidor');
        }
        persistLogin(user);
        window.location.href = 'principal.html';
      } catch (error) {
        console.warn('Fallo el inicio de sesion:', error);
        showError(error.message || 'No se pudo iniciar sesion');
      }
    });
  }

  if (registerButton) {
    registerButton.addEventListener('click', () => {
      window.location.href = 'registar.html';
    });
  }

  if (skipButton) {
    skipButton.addEventListener('click', () => {
      clearLogin();
      window.location.href = 'principal.html';
    });
  }

  toggleButtons.forEach((button) => {
    const targetId = button.getAttribute('data-password-toggle');
    const passwordInput = targetId ? document.getElementById(targetId) : null;
    if (!passwordInput) {
      return;
    }

    button.addEventListener('click', () => {
      const isVisible = passwordInput.getAttribute('type') === 'text';
      passwordInput.setAttribute('type', isVisible ? 'password' : 'text');
      button.classList.toggle('is-visible', !isVisible);
      button.setAttribute('aria-pressed', String(!isVisible));
      button.setAttribute(
        'aria-label',
        isVisible ? 'Mostrar contrasena' : 'Ocultar contrasena'
      );
    });
  });
});
