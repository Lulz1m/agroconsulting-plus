/* AgroConsulting Plus contact form. Configure a newly issued Web3Forms key here when available. */
(function () {
  'use strict';

  window.AGRO_WEB3FORMS_ACCESS_KEY = window.AGRO_WEB3FORMS_ACCESS_KEY || '';
  var WEB3FORMS_ACCESS_KEY = window.AGRO_WEB3FORMS_ACCESS_KEY;
  var form = document.getElementById('contact-form');
  if (!form) return;

  var submitButton = document.getElementById('contact-submit');
  var status = document.getElementById('form-status');
  var originalButtonText = submitButton.textContent.trim();
  var isSubmitting = false;
  var fields = {
    name: { input: document.getElementById('contact-name'), error: document.getElementById('name-error') },
    email: { input: document.getElementById('contact-email'), error: document.getElementById('email-error') },
    phone: { input: document.getElementById('contact-phone'), error: document.getElementById('phone-error') },
    service: { input: document.getElementById('contact-service'), error: document.getElementById('service-error') },
    subject: { input: document.getElementById('contact-subject'), error: document.getElementById('subject-error') },
    message: { input: document.getElementById('contact-message'), error: document.getElementById('message-error') }
  };

  function setFieldError(field, message) {
    field.input.setCustomValidity(message);
    field.error.textContent = message;
    field.error.classList.toggle('hidden', !message);
    field.input.setAttribute('aria-invalid', String(Boolean(message)));
  }

  function validateField(key) {
    var field = fields[key];
    var input = field.input;
    var value = input.value.trim();
    var message = '';
    input.setCustomValidity('');

    if (input.required && !value) {
      message = 'Kjo fushë është e detyrueshme.';
    } else if (key === 'email' && value && !input.validity.valid) {
      message = 'Shkruani një adresë email-i të vlefshme.';
    } else if (key === 'phone' && value && !/^\+?[0-9\s().-]+$/.test(value)) {
      message = 'Shkruani një numër telefoni të vlefshëm.';
    } else if (key === 'phone' && value && value.replace(/\D/g, '').length < 7) {
      message = 'Numri i telefonit duhet të ketë të paktën 7 shifra.';
    } else if (key === 'message' && value.length < 20) {
      message = 'Mesazhi duhet të ketë të paktën 20 karaktere.';
    }

    setFieldError(field, message);
    return !message;
  }

  Object.keys(fields).forEach(function (key) {
    fields[key].input.addEventListener('input', function () { validateField(key); });
    fields[key].input.addEventListener('change', function () { validateField(key); });
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (isSubmitting) return;

    var valid = Object.keys(fields).map(validateField).every(Boolean);
    if (!valid) {
      status.textContent = 'Ju lutemi kontrolloni fushat e shënuara.';
      status.className = 'mt-4 min-h-6 text-sm leading-6 text-red-700';
      var firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (!WEB3FORMS_ACCESS_KEY.trim()) {
      status.textContent = 'Formulari është gati, por dërgimi nuk është aktivizuar ende. Konfiguroni një access key të ri Web3Forms për këtë projekt.';
      status.className = 'mt-4 min-h-6 text-sm leading-6 text-amber-800';
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.textContent = 'Duke dërguar…';
    status.textContent = 'Mesazhi po dërgohet…';
    status.className = 'mt-4 min-h-6 text-sm leading-6 text-agro-charcoal/70';

    try {
      var formData = new FormData(form);
      formData.set('access_key', WEB3FORMS_ACCESS_KEY.trim());
      var response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      var result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Dërgimi nuk u realizua.');

      form.reset();
      Object.keys(fields).forEach(function (key) { setFieldError(fields[key], ''); });
      status.textContent = 'Mesazhi juaj u dërgua me sukses. Faleminderit që kontaktuat AgroConsulting Plus!';
      status.className = 'mt-4 min-h-6 text-sm leading-6 font-semibold text-agro-green-dark';
    } catch (error) {
      status.textContent = 'Mesazhi nuk u dërgua. Kontrolloni lidhjen tuaj dhe provoni përsëri, ose na telefononi drejtpërdrejt.';
      status.className = 'mt-4 min-h-6 text-sm leading-6 text-red-700';
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.textContent = originalButtonText;
    }
  });
})();
