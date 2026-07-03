// ===== Navegación responsive (menú hamburguesa) =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const abierto = navLinks.classList.toggle('abierto');
  navToggle.setAttribute('aria-expanded', abierto);
});

// Cierra el menú al elegir una sección (útil en móvil)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('abierto');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== "Base de datos" local (localStorage) =====
// Este sitio es estático (HTML/CSS/JS), sin servidor ni base de datos real.
// Para simular el guardado de información, usamos localStorage del navegador:
// los mensajes y respuestas de encuesta quedan guardados en el propio equipo
// donde se abre la página.
const DB_MENSAJES = 'fauna_mensajes';
const DB_ENCUESTA = 'fauna_encuesta_resultados';

function leerDB(clave) {
  try {
    return JSON.parse(localStorage.getItem(clave)) || [];
  } catch (e) {
    return [];
  }
}

function guardarDB(clave, arreglo) {
  localStorage.setItem(clave, JSON.stringify(arreglo));
}

// ===== Formulario de contacto =====
const formContacto = document.getElementById('formContacto');
const estadoContacto = document.getElementById('estadoContacto');
const statMensajes = document.getElementById('statMensajes');

function actualizarContadorMensajes() {
  statMensajes.textContent = leerDB(DB_MENSAJES).length;
}

formContacto.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const asunto = document.getElementById('asunto').value;
  const mensaje = document.getElementById('mensaje').value.trim();

  if (!nombre || !correo || !asunto || !mensaje) {
    estadoContacto.textContent = 'Por favor completa todos los campos.';
    estadoContacto.className = 'estado-form error';
    return;
  }

  const registros = leerDB(DB_MENSAJES);
  registros.push({
    nombre,
    correo,
    asunto,
    mensaje,
    fecha: new Date().toISOString()
  });
  guardarDB(DB_MENSAJES, registros);

  estadoContacto.textContent = '¡Gracias! Tu mensaje fue guardado correctamente.';
  estadoContacto.className = 'estado-form ok';
  formContacto.reset();
  actualizarContadorMensajes();
});

// ===== Encuesta =====
const formEncuesta = document.getElementById('formEncuesta');
const resultadoEncuesta = document.getElementById('resultadoEncuesta');
const statParticipantes = document.getElementById('statParticipantes');
const statPromedio = document.getElementById('statPromedio');

function actualizarEstadisticasEncuesta() {
  const registros = leerDB(DB_ENCUESTA);
  statParticipantes.textContent = registros.length;

  if (registros.length === 0) {
    statPromedio.textContent = '0%';
    return;
  }

  const sumaPorcentajes = registros.reduce((total, r) => total + (r.puntaje / r.total) * 100, 0);
  const promedio = Math.round(sumaPorcentajes / registros.length);
  statPromedio.textContent = promedio + '%';
}

formEncuesta.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const datos = new FormData(formEncuesta);
  const preguntas = ['q1', 'q2', 'q3', 'q4'];
  let puntaje = 0;

  preguntas.forEach(pregunta => {
    if (datos.get(pregunta) === '1') {
      puntaje++;
    }
  });

  const total = preguntas.length;
  const porcentaje = Math.round((puntaje / total) * 100);

  const registros = leerDB(DB_ENCUESTA);
  registros.push({
    puntaje,
    total,
    fecha: new Date().toISOString()
  });
  guardarDB(DB_ENCUESTA, registros);

  let mensaje;
  if (porcentaje >= 75) {
    mensaje = '¡Muy bien! Tienes claros los puntos clave para la conservación de especies.';
  } else if (porcentaje >= 50) {
    mensaje = 'Vas por buen camino. Revisa la sección de Qué hacer para reforzar lo que falta.';
  } else {
    mensaje = 'Te recomendamos leer con calma las secciones de Información y Qué hacer de este sitio.';
  }

  resultadoEncuesta.textContent = `Obtuviste ${puntaje} de ${total} respuestas correctas (${porcentaje}%). ${mensaje}`;
  resultadoEncuesta.hidden = false;

  actualizarEstadisticasEncuesta();
});

// ===== Inicialización =====
actualizarContadorMensajes();
actualizarEstadisticasEncuesta();
