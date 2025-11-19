document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const registerButton = document.getElementById('register-button');
  const toggleButtons = document.querySelectorAll('[data-password-toggle]');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      window.location.href = 'principal.html';
    });
  }

  if (registerButton) {
    registerButton.addEventListener('click', () => {
      window.location.href = 'registar.html';
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
