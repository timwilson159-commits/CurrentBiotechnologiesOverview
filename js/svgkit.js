window.SVGKit = (function () {
  const NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, parent, text) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function pt(svg, ev) {
    const p = svg.createSVGPoint();
    p.x = ev.clientX; p.y = ev.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  function rng(seed) {
    let a = seed;
    return () => { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296; };
  }
  return { s, pt, rng, NS };
})();
