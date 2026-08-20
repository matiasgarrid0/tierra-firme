// ============================================================
// DATOS DE CONTACTO — editar SOLO acá y se actualiza todo el sitio
// ============================================================
var WA_NUMBER   = "5492615790298";          // formato 549261XXXXXXX, sin +, sin espacios (para wa.me)
var TEL_LINK    = "+5492615790298";         // mismo número, con + (para href="tel:")
var TEL_HUMAN   = "+54 9 261 579-0298";     // como se muestra en pantalla
var EMAIL       = "info@tierrafirmeconsultora.com.ar";
var WA_GREETING = "Hola, quisiera consultar por la subdivisión de un terreno en...";
var WEB3FORMS_KEY = "005e63c2-e781-40f7-835f-558ac353089d";
// ============================================================

// Los datos ya vienen escritos en el HTML servido; esto solo los sobreescribe
// para que un cambio acá alcance para actualizar todas las páginas.
var waLink = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(WA_GREETING);
document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = waLink; });
document.querySelectorAll("[data-tel]").forEach(function (a) {
  a.href = "tel:" + TEL_LINK;
  a.textContent = TEL_HUMAN;
});
document.querySelectorAll("[data-mail]").forEach(function (a) {
  a.href = "mailto:" + EMAIL;
  a.textContent = EMAIL;
});

// Menú hamburguesa (mobile)
var navToggle = document.getElementById("nav-toggle");
var primaryNav = document.getElementById("primary-nav");
if (navToggle && primaryNav) {
  var closeNav = function () {
    primaryNav.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };
  navToggle.addEventListener("click", function () {
    var isOpen = primaryNav.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  primaryNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeNav);
  });
}

// El formulario abre WhatsApp con los datos cargados y, en paralelo, manda una
// copia por email. Solo existe en la home y en /contacto: en el resto no hace nada.
function normalizeField(str) {
  return str.trim().replace(/\s+/g, " ");
}
function normalizeMensaje(str) {
  return str.trim().replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
}

var formContacto = document.getElementById("form-contacto");
if (formContacto) {
  formContacto.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    var status = document.getElementById("form-status");
    var submitBtn = f.querySelector('button[type="submit"]');

    if (f.botcheck.checked) return; // honeypot: los bots lo completan, las personas no lo ven

    var nombre = normalizeField(f.nombre.value);
    var telefono = normalizeField(f.telefono.value);
    var email = normalizeField(f.email.value).toLowerCase();
    var departamento = f.departamento.value;
    var mensaje = normalizeMensaje(f.mensaje.value);

    if (!nombre || !telefono || !email || !departamento || !mensaje) {
      status.setAttribute("role", "alert");
      status.style.color = "var(--terra)";
      status.textContent = "Completá todos los campos antes de enviar.";
      status.style.display = "block";
      return;
    }

    f.nombre.value = nombre;
    f.telefono.value = telefono;
    f.email.value = email;
    f.mensaje.value = mensaje;

    var msg = "Hola, soy " + nombre + ".\n" +
      "Quisiera consultar por la subdivisión de un terreno en " + departamento + ".\n" +
      mensaje + "\n" +
      "Mis datos de contacto: " + telefono + " / " + email;

    var waWin = window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    if (!waWin) {
      window.location.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
    }

    submitBtn.disabled = true;

    var sendEmail = Promise.resolve();
    if (WEB3FORMS_KEY) {
      var fd = new FormData();
      fd.append("access_key", WEB3FORMS_KEY);
      fd.append("subject", "Nueva consulta desde el sitio de Tierra Firme");
      fd.append("name", nombre);
      fd.append("email", email);
      fd.append("telefono", telefono);
      fd.append("departamento", departamento);
      fd.append("mensaje", mensaje);
      sendEmail = fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd
      }).catch(function () {});
    }

    sendEmail.then(function () {
      status.setAttribute("role", "status");
      status.style.color = "var(--green)";
      status.textContent = "¡Listo! Te abrimos WhatsApp para que confirmes el envío. También registramos tu consulta por email.";
      status.style.display = "block";
      f.reset();
      submitBtn.disabled = false;
    });
  });
}
