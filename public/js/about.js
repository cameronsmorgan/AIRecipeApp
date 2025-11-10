// js/about.js
const connectors = Array.from(document.querySelectorAll('.connector'));

function preparePath(path) {
  // set dash array to full length so it can be drawn
  const len = Math.ceil(path.getTotalLength());
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  // ensure repaint
  path.getBoundingClientRect();
  return len;
}

function drawPath(path) {
  // animate to zero offset (CSS transition handles timing)
  path.style.strokeDashoffset = 0;
}

function animateConnector(conn) {
  if (!conn || conn.classList.contains('animated')) return;

  const mainPath = conn.querySelector('.connector-path.main');
  const sketchPath = conn.querySelector('.connector-path.sketch');

  if (!mainPath) return;

  // prepare & draw
  preparePath(mainPath);

  // small stagger so sketch overlay is visible and wobbles while draw happens
  setTimeout(() => {
    drawPath(mainPath);
    // mark as animated (useful for CSS states)
    conn.classList.add('animated');
  }, 60);
}

function elementInViewport(el, offset = 0) {
  const rect = el.getBoundingClientRect();
  return rect.top < (window.innerHeight || document.documentElement.clientHeight) - offset;
}

function checkConnectors() {
  connectors.forEach((conn) => {
    if (!conn.classList.contains('animated') && elementInViewport(conn, 50)) {
      animateConnector(conn);
    }
  });
}

// initial setup: prepare all main paths so dasharray is set (avoids flicker)
window.addEventListener('load', () => {
  connectors.forEach(conn => {
    const main = conn.querySelector('.connector-path.main');
    if (main) preparePath(main);
  });

  // run check on load and a delayed pass
  checkConnectors();
  setTimeout(checkConnectors, 300);
});

// animate on scroll
window.addEventListener('scroll', () => {
  checkConnectors();
});
