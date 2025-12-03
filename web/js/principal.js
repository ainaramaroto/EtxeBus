// principal.js

const API_BASE_URL = window.ETXEBUS_API_BASE || 'http://localhost:4000/api';

async function cargarUsuariosDestacados() {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/usuarios`);
    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status} al solicitar usuarios`);
    }
    const { data } = await respuesta.json();
    console.info('Usuarios disponibles desde el API Gateway', data);
  } catch (error) {
    console.warn('No se pudo recuperar la informacion de usuarios:', error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const botones = document.querySelectorAll('aside button');

  botones.forEach((boton) => {
    boton.addEventListener('click', () => {
      if (boton.dataset.link) {
        window.location.href = boton.dataset.link;
        return;
      }
      alert(`Has pulsado: ${boton.innerText}`);
      // Aqui podrias cargar contenido dinamico o mostrar info relacionada
    });
  });

  cargarUsuariosDestacados();
});
