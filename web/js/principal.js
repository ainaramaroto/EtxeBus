// dashboard.js

// Ejemplo: Acciones al hacer clic en los botones (podrás extenderlos luego)
document.addEventListener("DOMContentLoaded", () => {
  const botones = document.querySelectorAll("aside button");

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      alert(`Has pulsado: ${boton.innerText}`);
      // Aquí podrías cargar contenido dinámico o mostrar info
    });
  });
});
