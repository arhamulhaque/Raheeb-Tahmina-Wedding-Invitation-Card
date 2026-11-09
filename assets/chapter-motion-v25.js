/* Give each visible chapter its existing entrance and gold reflection. */
(() => {
  'use strict';
  if (document.currentScript?.hasAttribute('data-phone-only')) {
    if (!matchMedia('(max-width: 650px)').matches) return;
    document.documentElement.classList.add('mobile-stationery');
  }

  const chapters = [...document.querySelectorAll('#invitation-content > section')];
  const artwork = [...document.querySelectorAll('.gilt-art')];
  const entrance = '.word-reveal,[data-motion],.countdown-unit,.invitation-sheet,.event>:is(.event-tag,h3,.event-rule,.event-date,.event-time,.event-timezone,.event-venue,.event-address,.event-actions)';
  let observer;
  let resizeTimer;
  let knownWidth = document.getElementById('invitation-content').offsetWidth;

  for (const piece of artwork) {
    const mask = document.createElement('span');
    const sweep = document.createElement('span');
    mask.className = 'gilt-shimmer';
    mask.setAttribute('aria-hidden', 'true');
    sweep.className = 'gilt-sweep';
    mask.append(sweep);
    piece.append(mask);
  }

  function refreshMasks() {
    const styles = artwork.map(piece => {
      const style = getComputedStyle(piece);
      return [piece.querySelector('.gilt-shimmer'), style.backgroundImage, style.backgroundSize, style.backgroundPosition];
    });
    for (const [mask, image, size, position] of styles) {
      mask.style.maskImage = mask.style.webkitMaskImage = image;
      mask.style.maskSize = mask.style.webkitMaskSize = size;
      mask.style.maskPosition = mask.style.webkitMaskPosition = position;
    }
  }

  refreshMasks();

  function open() {
    if (observer || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) entry.target.classList.toggle('motion-sleep', !entry.isIntersecting);
    }, { rootMargin: '100px 0px', threshold: 0 });
    chapters.forEach(chapter => observer.observe(chapter));
  }

  function reset() {
    observer?.disconnect();
    observer = undefined;
    chapters.forEach(chapter => chapter.classList.remove('motion-sleep'));
    document.querySelectorAll('.motion-complete,.gilt-settled').forEach(element => {
      element.classList.remove('motion-complete', 'gilt-settled');
    });
  }

  document.addEventListener('animationend', event => {
    if (event.pseudoElement || event.target.closest('#invitation-cover')) return;
    if (event.target.matches('.gilt-art')) event.target.classList.add('gilt-settled');
    else if (event.target.matches(entrance)) event.target.classList.add('motion-complete');
  });

  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const width = document.getElementById('invitation-content').offsetWidth;
      if (Math.abs(width - knownWidth) < 2) return;
      knownWidth = width;
      refreshMasks();
    }, 180);
  });

  window.InvitationPolish = { open, reset };
})();
