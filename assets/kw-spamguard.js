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
})();
