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

  document.addEventListener('DOMContentLoaded', function () {
    initReveals();
    initReadouts();
  });

  document.addEventListener('shopify:section:load', function (e) {
    initReveals(e.target);
    initReadouts(e.target);
  });
})();
