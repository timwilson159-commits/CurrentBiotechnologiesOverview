window.GeneScene = (function () {
  const { s } = SVGKit;
  const G = {
    W: 800, H: 420,
    plasmid: { cx: 200, cy: 300, r: 70, halfGap: 24 },
    geneBox: { x: 316, y: 60, w: 114, h: 36 },
    freeOffset: { x: 0, y: 70 },
    defaultZone: { x: 140, y: 200, w: 120, h: 60 }
  };
  const rad = d => d * Math.PI / 180;
  const pt = (r, a) => [r * Math.cos(rad(a)), r * Math.sin(rad(a))];
  G.arc = (r, a1, a2, large) => {
    const [x1, y1] = pt(r, a1), [x2, y2] = pt(r, a2);
    return `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  G.draw = function (svg) {
    svg.setAttribute('viewBox', `0 0 ${G.W} ${G.H}`);
    const gb = G.geneBox;
    s('text', { x: 60, y: 40, class: 'sc-label' }, svg, 'Human DNA (part of a chromosome)');

    [[60, 256], [430, 310]].forEach(([x, w]) => {
      s('rect', { x, y: gb.y, width: w, height: gb.h, fill: '#dfe6ea', stroke: '#8a979f', 'stroke-width': 2 }, svg);
      for (let i = x + 8; i < x + w - 4; i += 12) s('line', { x1: i, y1: gb.y + 6, x2: i, y2: gb.y + gb.h - 6, stroke: '#b7c3ca', 'stroke-width': 2 }, svg);
    });

    const gene = s('g', { class: 'grab' }, svg);
    s('rect', { x: gb.x, y: gb.y, width: gb.w, height: gb.h, fill: '#2f6f55', stroke: '#1d4d3a', 'stroke-width': 2 }, gene);
    for (let i = gb.x + 8; i < gb.x + gb.w - 4; i += 12) s('line', { x1: i, y1: gb.y + 6, x2: i, y2: gb.y + gb.h - 6, stroke: 'rgba(255,255,255,.28)', 'stroke-width': 2 }, gene);
    s('text', { x: gb.x + gb.w / 2, y: gb.y + gb.h / 2 + 5, 'text-anchor': 'middle', class: 'sc-white' }, gene, 'insulin gene');

    const cuts = [gb.x, gb.x + gb.w].map(x => {
      const g = s('g', { class: 'hot' }, svg);
      s('line', { x1: x, y1: 48, x2: x, y2: 110, stroke: '#a8372e', 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }, g);
      s('rect', { x: x - 30, y: 114, width: 60, height: 26, rx: 4, fill: '#fffdf8', stroke: '#a8372e', 'stroke-width': 2, class: 'hl' }, g);
      s('text', { x, y: 132, 'text-anchor': 'middle', class: 'sc-note lt' }, g, 'Cut here');
      return g;
    });
    const cutNote = s('text', { x: 373, y: 168, 'text-anchor': 'middle', class: 'sc-note' }, svg, 'restriction enzyme');

    const P = G.plasmid;
    const plasmid = s('g', { transform: `translate(${P.cx},${P.cy})` }, svg);
    const ring = s('path', { d: G.arc(P.r, -90 + P.halfGap, 270 - P.halfGap, 1), fill: 'none', stroke: '#5c6b78', 'stroke-width': 12, 'stroke-linecap': 'butt' }, plasmid);
    s('text', { x: 0, y: 6, 'text-anchor': 'middle', class: 'sc-note lt' }, plasmid, 'plasmid');
    s('text', { x: P.cx, y: 404, 'text-anchor': 'middle', class: 'sc-label' }, svg, 'Bacterial plasmid, cut by the same enzyme');

    const bact = s('g', {}, svg);
    s('rect', { x: 470, y: 250, width: 270, height: 130, rx: 65, fill: '#eef3ec', stroke: '#5c7a52', 'stroke-width': 3 }, bact);
    s('path', { d: 'M520 315 q25 -45 50 0 t50 0 t50 0 t50 0', fill: 'none', stroke: '#9aa8a0', 'stroke-width': 4 }, bact);
    s('text', { x: 605, y: 404, 'text-anchor': 'middle', class: 'sc-label' }, svg, 'Bacterium (E. coli)');

    return { svg, gene, cuts, cutNote, plasmid, ring, bact };
  };
  return G;
})();
