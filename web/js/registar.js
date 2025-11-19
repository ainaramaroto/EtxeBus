document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const messageBox = document.getElementById('register-message');
  const password = document.getElementById('register-password');
  const passwordConfirm = document.getElementById('register-password-confirm');
  const toggleButtons = document.querySelectorAll('[data-password-toggle]');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!password || !passwordConfirm || !messageBox) {
        return;
      }

      if (password.value !== passwordConfirm.value) {
        messageBox.textContent = 'Las contrasenas no coinciden.';
        return;
      }

      messageBox.textContent = '';
      window.location.href = 'login.html';
    });
  }

  toggleButtons.forEach((button) => {
    const targetId = button.getAttribute('data-password-toggle');
    const targetInput = targetId ? document.getElementById(targetId) : null;
    if (!targetInput) {
      return;
    }

    button.addEventListener('click', () => {
      const isVisible = targetInput.getAttribute('type') === 'text';
      targetInput.setAttribute('type', isVisible ? 'password' : 'text');
      button.classList.toggle('is-visible', !isVisible);
      button.setAttribute('aria-pressed', String(!isVisible));
      button.setAttribute(
        'aria-label',
        isVisible ? 'Mostrar contrasena' : 'Ocultar contrasena'
      );
    });
  });
});
