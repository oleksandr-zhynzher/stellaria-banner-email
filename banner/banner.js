(function () {
  const countTarget = document.getElementById("pilot-count");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!countTarget) {
    return;
  }

  if (prefersReducedMotion) {
    countTarget.textContent = "412";
    return;
  }

  window.setTimeout(() => {
    const start = performance.now();
    const duration = 950;
    const target = 412;

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      countTarget.textContent = String(Math.round(eased * target));

      if (progress < 1) {
        window.requestAnimationFrame(update);
      }
    }

    window.requestAnimationFrame(update);
  }, 5900);
})();
