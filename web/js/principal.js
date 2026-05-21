// principal.js

const API_BASE_URL = window.ETXEBUS_API_BASE || 'http://localhost:4000/api';

function getCurrentSessionAuth() {
  const user = window.EtxebusSession?.getUser?.();
  const authHeader = window.EtxebusSession?.getAuthorizationHeader?.();
  if (!user || !authHeader) return null;

  const idUsuario = Number(user.idUsuario ?? user.id);
  if (!Number.isFinite(idUsuario)) return null;

  return {
    idUsuario,
    authHeader,
  };
}

async function cargarUsuariosDestacados() {
  const auth = getCurrentSessionAuth();
  if (!auth) {
    return;
  }

  try {
    const respuesta = await fetch(`${API_BASE_URL}/usuarios/${auth.idUsuario}`, {
      headers: {
        Authorization: auth.authHeader,
      },
    });
    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status} al solicitar usuario`);
    }
    const { data } = await respuesta.json();
    console.info('Usuario autenticado desde el API Gateway', data);
  } catch (error) {
    console.warn('No se pudo recuperar la informacion del usuario:', error.message);
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
