(function () {
  'use strict';

  // Cursor glow, desktop only
  var glow = document.createElement('div');
  glow.id = 'kw-cursor-glow';
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(glow);
  });
  window.addEventListener('pointermove', function (e) {
    glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
  }, { passive: true });

  // Scroll reveal
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
    (root || document).querySelectorAll('.kw-reveal, .kw-reveal-scale').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // Count-up stats
  function animateCount(el) {
    var target = parseFloat(el.dataset.count || '0');
    var suffix = el.dataset.suffix || '';
    var decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  var countObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  function initCounters(root) {
    (root || document).querySelectorAll('[data-count]').forEach(function (el) {
      countObserver.observe(el);
    });
  }

  // Magnetic buttons
  function initMagnetic(root) {
    (root || document).querySelectorAll('.kw-magnetic').forEach(function (btn) {
      if (btn.dataset.kwMagneticBound) return;
      btn.dataset.kwMagneticBound = '1';
      btn.addEventListener('pointermove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.28 + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveals();
    initCounters();
    initMagnetic();
  });

  document.addEventListener('shopify:section:load', function (e) {
    initReveals(e.target);
    initCounters(e.target);
    initMagnetic(e.target);
  });
})();
