const API_BASE_URL = window.ETXEBUS_API_BASE || 'http://localhost:4000/api';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const messageBox = document.getElementById('register-message');
  const password = document.getElementById('register-password');
  const passwordConfirm = document.getElementById('register-password-confirm');
  const nameInput = document.getElementById('register-name');
  const emailInput = document.getElementById('register-email');
  const toggleButtons = document.querySelectorAll('[data-password-toggle]');

  function showMessage(message, isError = true) {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.classList.toggle('is-success', !isError);
  }

  async function createAccount(payload) {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    let body = null;
    try {
      body = await response.json();
    } catch (error) {
      body = null;
    }
    if (!response.ok) {
      let errorMessage = body?.message || `HTTP ${response.status}`;
      if (response.status === 409) {
        errorMessage = body?.message || 'El correo ya esta registrado.';
      }
      throw new Error(errorMessage);
    }
    return body?.data || null;
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!password || !passwordConfirm || !messageBox || !nameInput || !emailInput) {
        return;
      }

      const passValue = password.value || '';
      if (passValue !== (passwordConfirm.value || '')) {
        showMessage('Las contrasenas no coinciden.');
        return;
      }

      const nomUsuario = nameInput.value.trim();
      const email = emailInput.value.trim();
      if (!nomUsuario || !email) {
        showMessage('Debes completar nombre y correo.');
        return;
      }

      if (passValue.length < 6 || passValue.length > 15) {
        showMessage('La contrasena debe tener entre 6 y 15 caracteres.');
        return;
      }

      try {
        await createAccount({
          nomUsuario,
          email,
          contrasenia: passValue,
        });
        showMessage('Cuenta creada correctamente. Redirigiendo...', false);
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1200);
      } catch (error) {
        console.warn('No se pudo crear la cuenta:', error);
        showMessage(error.message || 'No se pudo crear la cuenta.');
      }
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
