/* Shared AgroConsulting Plus contact-form validation and optional Web3Forms submission. */
(function () {
  'use strict';

  window.AGRO_WEB3FORMS_ACCESS_KEY = window.AGRO_WEB3FORMS_ACCESS_KEY || '';
  var accessKey = window.AGRO_WEB3FORMS_ACCESS_KEY;

  document.querySelectorAll('[data-contact-form]').forEach(function (form) {
    var submitButton = form.querySelector('[data-form-submit]');
    var status = form.querySelector('[data-form-status]');
    var fields = Array.prototype.slice.call(form.querySelectorAll('[data-contact-field]')).map(function (input) {
      return { input: input, error: form.querySelector('[data-error-for="' + input.name + '"]') };
    });
    var originalButtonText = submitButton.textContent.trim();
    var isSubmitting = false;

    function setFieldError(field, message) {
      field.input.setCustomValidity(message);
      if (field.error) {
        field.error.textContent = message;
        field.error.classList.toggle('hidden', !message);
      }
      field.input.setAttribute('aria-invalid', String(Boolean(message)));
    }

    function validateField(field) {
      var input = field.input;
      var key = input.name;
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
      } else if (key === 'message' && value.length < input.minLength) {
        message = 'Mesazhi duhet të ketë të paktën ' + input.minLength + ' karaktere.';
      }

      setFieldError(field, message);
      return !message;
    }

    fields.forEach(function (field) {
      field.input.addEventListener('input', function () { validateField(field); });
      field.input.addEventListener('change', function () { validateField(field); });
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (isSubmitting) return;

      var valid = fields.map(validateField).every(Boolean);
      if (!valid) {
        status.textContent = 'Ju lutemi kontrolloni fushat e shënuara.';
        status.className = 'mt-3 min-h-6 text-sm leading-6 text-red-700';
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (!accessKey.trim()) {
        status.textContent = 'Formulari është gati, por dërgimi nuk është aktivizuar ende. Konfiguroni një access key të ri Web3Forms për këtë projekt.';
        status.className = 'mt-3 min-h-6 text-sm leading-6 text-amber-800';
        return;
      }

      isSubmitting = true;
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      submitButton.textContent = 'Duke dërguar…';
      status.textContent = 'Mesazhi po dërgohet…';
      status.className = 'mt-3 min-h-6 text-sm leading-6 text-agro-charcoal/70';

      try {
        var formData = new FormData(form);
        formData.set('access_key', accessKey.trim());
        var response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(Object.fromEntries(formData))
        });
        var result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Dërgimi nuk u realizua.');

        form.reset();
        fields.forEach(function (field) { setFieldError(field, ''); });
        status.textContent = 'Mesazhi juaj u dërgua me sukses. Faleminderit që kontaktuat AgroConsulting Plus!';
        status.className = 'mt-3 min-h-6 text-sm leading-6 font-semibold text-agro-green-dark';
      } catch (error) {
        status.textContent = 'Mesazhi nuk u dërgua. Kontrolloni lidhjen tuaj dhe provoni përsëri, ose na telefononi drejtpërdrejt.';
        status.className = 'mt-3 min-h-6 text-sm leading-6 text-red-700';
      } finally {
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
        submitButton.textContent = originalButtonText;
      }
    });
  });
})();
