document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const registerButton = document.getElementById('register-button');
  const skipButton = document.getElementById('skip-login');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const toggleButtons = document.querySelectorAll('[data-password-toggle]');

  function persistLogin(credentials) {
    if (window.EtxebusSession) {
      window.EtxebusSession.setUser(credentials);
      window.EtxebusSession.setLoggedIn(true);
    } else {
      window.localStorage.setItem('etxebusSession', 'authenticated');
      window.localStorage.setItem('etxebusUser', JSON.stringify(credentials));
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

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const credentials = {
        usuario: emailInput?.value?.trim() || 'invitado',
        contrasenia: passwordInput?.value || '',
      };
      persistLogin(credentials);
      window.location.href = 'principal.html';
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
