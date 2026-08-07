(function () {
  var MIN_SECONDS = 3;

  function guard(form) {
    var startedAt = Date.now();
    var renderedAtField = form.querySelector('.kw-qform__rendered-at');
    if (renderedAtField) renderedAtField.value = String(startedAt);

    form.addEventListener('submit', function (event) {
      var honeypot = form.querySelector('input[name="contact[website]"]');
      var tooFast = Date.now() - startedAt < MIN_SECONDS * 1000;

      if ((honeypot && honeypot.value.trim() !== '') || tooFast) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

  document.querySelectorAll('form[data-kw-spamguard]').forEach(guard);

  function decodePhoneLink(el) {
    var reversed = el.getAttribute('data-p');
    if (!reversed) return;

    var digits = reversed.split('').reverse().join('');
    var mode = el.getAttribute('data-mode') || 'tel';
    el.setAttribute('href', mode + ':' + digits);

    if (el.hasAttribute('data-show-number')) {
      var formatted = digits.length === 10
        ? digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6)
        : digits;
      var prefix = el.getAttribute('data-prefix') || '';
      var textEl = el.querySelector('.kw-phone-link__text') || el;
      textEl.textContent = prefix + formatted;
    }
  }

  document.querySelectorAll('[data-kw-phone]').forEach(decodePhoneLink);

  function decodeEmailLink(el) {
    var reversed = el.getAttribute('data-e');
    if (!reversed) return;

    var email = reversed.split('').reverse().join('');
    el.setAttribute('href', 'mailto:' + email);

    if (el.hasAttribute('data-show-email')) {
      el.textContent = email;
    }
  }

  document.querySelectorAll('[data-kw-email]').forEach(decodeEmailLink);
})();
