window.SimKit = (function () {
  const { el } = BioLab;
  const { s, pt, rng } = SVGKit;
  let uid = 0;

  function shell(box, o, next) {
    const w = el('div', 'sim');
    w.appendChild(el('div', 'kicker', o.kicker));
    w.appendChild(el('h2', 'sec-h', o.title));
    w.appendChild(el('p', 'brief', o.brief));
    const stage = el('div', 'sim-stage');
    const tools = el('div', 'sim-tools');
    const chips = el('div', 'chips');
    const status = el('div', 'msg');
    const acts = el('div', 'actions');
    const go = el('button', 'btn', o.button || 'Continue');
    go.hidden = true;
    go.onclick = next;
    acts.appendChild(go);
    w.append(stage, chips, tools, status, acts);
    box.appendChild(w);
    return {
      stage, tools, chips,
      chip(t) { chips.textContent = ''; chips.appendChild(el('span', 'chip', t)); },
      reset() { go.hidden = true; },
      say(t, c) { status.textContent = t; status.className = 'msg ' + (c || ''); },
      finish(t) { status.textContent = t; status.className = 'msg good'; go.hidden = false; go.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    };
  }

  function toolBtn(k, label, onclick, ghost) {
    const b = el('button', 'btn' + (ghost ? ' ghost' : ''), label);
    b.onclick = onclick;
    k.tools.appendChild(b);
    return b;
  }

  /* brightfield microscope field of view; pipette tip follows the pointer */
  function microscope(stage) {
    const id = 'm' + (++uid);
    const svg = s('svg', { viewBox: '0 0 800 440', class: 'scope' }, stage);
    const defs = s('defs', {}, svg);
    const g = s('radialGradient', { id: id + 'g', cx: '50%', cy: '50%', r: '62%' }, defs);
    s('stop', { offset: '0', 'stop-color': '#e9eeea' }, g);
    s('stop', { offset: '1', 'stop-color': '#a6b6b1' }, g);
    const cp = s('clipPath', { id: id + 'c' }, defs);
    s('circle', { cx: 400, cy: 220, r: 205 }, cp);
    s('rect', { x: 0, y: 0, width: 800, height: 440, fill: '#161b20' }, svg);
    const fov = s('g', { 'clip-path': `url(#${id}c)` }, svg);
    s('circle', { cx: 400, cy: 220, r: 205, fill: `url(#${id}g)` }, fov);
    const layer = s('g', {}, fov);
    const pip = s('g', { visibility: 'hidden', 'pointer-events': 'none' }, fov);
    s('polygon', { points: '0,0 -600,-18 -600,18', fill: 'rgba(255,255,255,.45)', stroke: '#4f5b66', 'stroke-width': 2 }, pip);
    s('line', { x1: -40, y1: 0, x2: -600, y2: 0, stroke: 'rgba(79,91,102,.45)', 'stroke-width': 2 }, pip);
    s('circle', { cx: 400, cy: 220, r: 205, fill: 'none', stroke: '#0b0e11', 'stroke-width': 8 }, svg);
    s('line', { x1: 620, y1: 408, x2: 700, y2: 408, stroke: '#cfd6dc', 'stroke-width': 3 }, svg);
    s('text', { x: 660, y: 430, 'text-anchor': 'middle', class: 'sc-scale' }, svg, '50 µm');
    svg.addEventListener('pointermove', e => {
      const p = pt(svg, e);
      pip.setAttribute('transform', `translate(${p.x},${p.y})`);
      pip.setAttribute('visibility', 'visible');
    });
    svg.addEventListener('pointerleave', () => pip.setAttribute('visibility', 'hidden'));
    return { svg, layer, pip };
  }

  /* holding pipette: thick glass tube coming in from the left, ending at x */
  function holder(layer, endX, cy) {
    const g = s('g', {}, layer);
    s('rect', { x: endX, y: cy - 34, width: 840 - endX, height: 68, rx: 10, fill: 'rgba(255,255,255,.5)', stroke: '#4f5b66', 'stroke-width': 2 }, g);
    s('rect', { x: endX, y: cy - 14, width: 840 - endX, height: 28, fill: 'rgba(120,140,150,.28)' }, g);
    return g;
  }

  function egg(layer, cx, cy, withNucleus, seed) {
    const g = s('g', {}, layer);
    s('circle', { cx, cy, r: 112, fill: 'none', stroke: '#d9c08b', 'stroke-width': 14, opacity: .85 }, g);
    s('circle', { cx, cy, r: 104, fill: '#f0dacd', stroke: '#c7a698', 'stroke-width': 2 }, g);
    const r = rng(seed || 7);
    for (let i = 0; i < 46; i++) {
      const a = r() * 6.283, d = Math.sqrt(r()) * 96;
      s('circle', { cx: cx + Math.cos(a) * d, cy: cy + Math.sin(a) * d, r: 1.8 + r() * 3, fill: '#dbb9ab', opacity: .8 }, g);
    }
    let nuc = null;
    if (withNucleus) nuc = nucleus(layer, cx - 28, cy - 22, 17);
    return { g, nuc };
  }

  function nucleus(parent, x, y, r) {
    const g = s('g', { transform: `translate(${x},${y})` }, parent);
    s('circle', { cx: 0, cy: 0, r, fill: '#6573b0', stroke: '#3f4b86', 'stroke-width': 2 }, g);
    s('circle', { cx: -r * .25, cy: -r * .2, r: r * .32, fill: '#3a447a' }, g);
    return g;
  }

  function anim(ms, f) {
    return new Promise(res => {
      const t0 = performance.now();
      const id = setInterval(() => {
        const u = Math.min(1, (performance.now() - t0) / ms);
        f(u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, u);
        if (u >= 1) { clearInterval(id); res(); }
      }, 16);
    });
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function sheep(parent, o) {
    const face = o.face || '#f1ece0';
    const g = s('g', { transform: `translate(${o.x},${o.y}) scale(${o.s || 1})` }, parent);
    if (o.udder) s('ellipse', { cx: -22, cy: 30, rx: 12, ry: 9, fill: '#e3a9a6', stroke: '#b97c74', 'stroke-width': 1.5 }, g);
    [[-30, 20], [-14, 22], [16, 22], [32, 20]].forEach(([x, y]) => {
      s('line', { x1: x, y1: y, x2: x, y2: 52, stroke: '#3a3a3a', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    });
    s('ellipse', { cx: 0, cy: 0, rx: 50, ry: 30, fill: '#f4f0e6', stroke: '#c9c1ac', 'stroke-width': 2 }, g);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * 6.283;
      s('circle', { cx: Math.cos(a) * 46, cy: Math.sin(a) * 26, r: 11, fill: '#f4f0e6', stroke: '#c9c1ac', 'stroke-width': 1.5 }, g);
    }
    s('ellipse', { cx: 0, cy: 0, rx: 46, ry: 26, fill: '#f4f0e6' }, g);
    s('circle', { cx: -50, cy: -4, r: 8, fill: '#f4f0e6', stroke: '#c9c1ac', 'stroke-width': 1.5 }, g);
    s('ellipse', { cx: 54, cy: -22, rx: 11, ry: 5, fill: face, stroke: 'rgba(0,0,0,.25)', transform: 'rotate(-30 54 -22)' }, g);
    s('ellipse', { cx: 64, cy: -6, rx: 16, ry: 14, fill: face, stroke: 'rgba(0,0,0,.28)', 'stroke-width': 1.5 }, g);
    s('circle', { cx: 70, cy: -10, r: 2.4, fill: face === '#f1ece0' ? '#222' : '#eee' }, g);
    s('ellipse', { cx: 77, cy: -1, rx: 4, ry: 3, fill: '#d79a98' }, g);
    return g;
  }

  return { shell, toolBtn, microscope, holder, egg, nucleus, sheep, anim, wait };
})();
