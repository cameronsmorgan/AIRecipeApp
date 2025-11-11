// Animate ornate connectors when they appear in view
const connectors = Array.from(document.querySelectorAll('.connector-image'));

if (connectors.length) {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1,
  };

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        el.style.setProperty('--reveal-delay', `${delay}ms`);
        setTimeout(() => el.classList.add('animated'), delay + 30);
        observer.unobserve(el);
      }
    });
  }, observerOptions);

  connectors.forEach((el, i) => {
    if (!el.hasAttribute('data-delay')) {
      el.setAttribute('data-delay', `${i * 120}`);
    }
    obs.observe(el);
  });
}
