(function () {
  'use strict';

  // Precision reticle cursor — small crosshair + ring, desktop only.
  var reticle = document.createElement('div');
  reticle.id = 'kw-reticle';
  var ring = document.createElement('div');
  ring.className = 'kw-reticle-ring';
  reticle.appendChild(ring);

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(reticle);
  });

  var reticleReady = false;
  window.addEventListener('pointermove', function (e) {
    if (!reticleReady) {
      document.body.classList.add('kw-cursor-ready');
      reticleReady = true;
    }
    reticle.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
  }, { passive: true });

  document.addEventListener('pointerdown', function () {
    reticle.classList.add('is-active');
  });
  document.addEventListener('pointerup', function () {
    reticle.classList.remove('is-active');
  });

  // Scroll reveal: fade/clip-reveal blocks, plus bracket frames and
  // one-time scanline sweeps.
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  function initReveals(root) {
    (root || document).querySelectorAll('.kw-reveal, .kw-reveal-scale, .kw-bracket, .kw-scanline').forEach(function (el) {
      revealObserver.observe(el);
      // Safety net: force-reveal if the observer never reports intersecting
      // (e.g. an element whose own styling zeroes its visible area).
      window.setTimeout(function () {
        el.classList.add('is-visible');
      }, 2500);
    });
  }

  // Odometer-style digit roll for stats: cycles random digits briefly
  // before settling on the target number.
  function animateReadout(el) {
    var target = parseFloat(el.dataset.count || '0');
    var suffix = el.dataset.suffix || '';
    var decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    var duration = 900;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      if (progress < 1) {
        var jitterProgress = 1 - Math.pow(1 - progress, 2);
        var value = target * jitterProgress;
        var jitter = (1 - progress) * target * 0.35 * (Math.random() - 0.5);
        el.textContent = Math.max(0, value + jitter).toFixed(decimals) + suffix;
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  var readoutObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateReadout(entry.target);
          readoutObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  function initReadouts(root) {
    (root || document).querySelectorAll('[data-count]').forEach(function (el) {
      readoutObserver.observe(el);
    });
  }

  // Smart light switch: pick a color, the whole site's accent re-lights.
  function initLightSwitch() {
    var root = document.getElementById('kw-lightswitch');
    if (!root) return;

    var toggle = document.getElementById('kw-ls-toggle');
    var flash = document.getElementById('kw-ls-flash');
    var swatches = root.querySelectorAll('[data-kw-ls-color]');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      var savedAccent = window.localStorage.getItem('kw-accent');
      if (savedAccent) {
        swatches.forEach(function (s) {
          s.setAttribute('aria-pressed', s.dataset.kwLsColor === savedAccent ? 'true' : 'false');
        });
      }
    } catch (err) {
      /* localStorage unavailable — swatches keep their default pressed state */
    }

    toggle.addEventListener('click', function () {
      var open = root.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
      if (!root.contains(e.target)) {
        root.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    swatches.forEach(function (swatch) {
      swatch.addEventListener('click', function (e) {
        var color = swatch.dataset.kwLsColor;

        document.documentElement.style.setProperty('--kw-gold', color);
        try {
          window.localStorage.setItem('kw-accent', color);
        } catch (err) {
          /* localStorage unavailable (private mode) — color still applies for this session */
        }

        swatches.forEach(function (s) {
          s.setAttribute('aria-pressed', s === swatch ? 'true' : 'false');
        });

        if (!reduceMotion && flash) {
          var rect = swatch.getBoundingClientRect();
          flash.style.setProperty('--flash-x', rect.left + rect.width / 2 + 'px');
          flash.style.setProperty('--flash-y', rect.top + rect.height / 2 + 'px');
          flash.style.setProperty('--flash-color', color);
          flash.classList.remove('is-flashing');
          void flash.offsetWidth;
          flash.classList.add('is-flashing');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveals();
    initReadouts();
    initLightSwitch();
  });

  document.addEventListener('shopify:section:load', function (e) {
    initReveals(e.target);
    initReadouts(e.target);
  });
})();
