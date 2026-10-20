(function () {
const { el } = BioLab;
const { s, pt } = SVGKit;
const K = SimKit;
const TOTAL = 7;
const head = (n, title, brief) => ({ kicker: `Lab step ${n} of ${TOTAL}`, title, brief });
const EGG_R = 104;

/* ---------- 1. collect eggs ---------- */
function step1(box, next) {
  const k = K.shell(box, head(1, 'Collect eggs from the donor ewe',
    'We need unfertilised egg cells (oocytes) from a female sheep. She is given hormones so her ovaries ripen several eggs at once. Click four follicles to collect their eggs.'), next);
  const svg = s('svg', { viewBox: '0 0 800 420' }, k.stage);
  s('ellipse', { cx: 310, cy: 210, rx: 240, ry: 165, fill: '#e6bfae', stroke: '#b98777', 'stroke-width': 3 }, svg);
  s('text', { x: 310, y: 405, 'text-anchor': 'middle', class: 'sc-label' }, svg, 'Ovary of the egg donor ewe');
  s('circle', { cx: 690, cy: 215, r: 85, fill: '#f4f7f6', stroke: '#8a979f', 'stroke-width': 3 }, svg);
  s('circle', { cx: 690, cy: 215, r: 73, fill: 'none', stroke: '#c8d1d6', 'stroke-width': 2 }, svg);
  s('text', { x: 690, y: 335, 'text-anchor': 'middle', class: 'sc-label' }, svg, 'Collection dish');
  const slots = [[662, 190], [718, 190], [662, 243], [718, 243]];
  const P = [[-130, -50], [-45, -100], [60, -85], [140, -15], [95, 80], [-20, 105], [-120, 50]];
  let got = 0;
  k.chip('Eggs collected: 0 of 4');
  P.forEach(([dx, dy]) => {
    const g = s('g', { class: 'hot' }, svg);
    const x = 310 + dx, y = 210 + dy;
    const f = s('circle', { cx: x, cy: y, r: 30, fill: '#f8ece3', stroke: '#c79c8a', 'stroke-width': 2.5, class: 'hl' }, g);
    const oo = s('circle', { cx: x + 3, cy: y + 2, r: 11, fill: '#f2c9bf', stroke: '#b97c74', 'stroke-width': 1.8 }, g);
    g.addEventListener('click', () => {
      if (g.dataset.d) return;
      if (got >= 4) { k.say('Four eggs is enough for this experiment.'); return; }
      g.dataset.d = 1;
      oo.remove();
      f.setAttribute('fill', 'none');
      f.setAttribute('stroke-dasharray', '5 4');
      g.style.cursor = 'default';
      const [ex, ey] = slots[got];
      s('circle', { cx: ex, cy: ey, r: 13, fill: '#f2c9bf', stroke: '#b97c74', 'stroke-width': 2, class: 'pop' }, svg);
      got++;
      k.chip(`Eggs collected: ${got} of 4`);
      if (got === 4) k.finish('Four eggs collected. They have not been fertilised, so each still has only half a set of chromosomes.');
      else k.say('Egg collected.', 'good');
    });
  });
}

/* ---------- 2. enucleate ---------- */
function step2(box, next) {
  const k = K.shell(box, head(2, 'Remove the nucleus from each egg',
    'The egg\'s own DNA has to go, or the clone would carry DNA from two sheep. The left pipette holds the egg steady. Click and drag the nucleus out of the egg with your micropipette. Enucleate three eggs.'), next);
  const m = K.microscope(k.stage);
  const C = { x: 400, y: 220 };
  const TOT = 3;
  let n = 0;
  k.chip('Eggs enucleated: 0 of 3');
  function drawEgg() {
    m.layer.innerHTML = '';
    K.holder(m.layer, 284, C.y);
    K.egg(m.layer, C.x, C.y, false, 11 + n * 5);
    const start = { x: C.x + [-30, 28, -8][n], y: C.y + [-24, -16, 32][n] };
    const nuc = K.nucleus(m.layer, start.x, start.y, 17);
    nuc.classList.add('grab');
    const hint = s('text', { x: start.x + 24, y: start.y + 5, class: 'sc-note lt' }, m.layer, 'Nucleus');
    s('text', { x: C.x, y: 98, 'text-anchor': 'middle', class: 'sc-note lt' }, m.layer, `Egg ${n + 1} of ${TOT}`);
    let pos = { ...start }, drag = false, solved = false;
    nuc.addEventListener('pointerdown', ev => {
      if (solved) return;
      ev.preventDefault();
      try { nuc.setPointerCapture(ev.pointerId); } catch (_) {}
      drag = true;
      hint.remove();
    });
    nuc.addEventListener('pointermove', ev => {
      if (!drag) return;
      const p = pt(m.svg, ev);
      const dx = p.x - C.x, dy = p.y - C.y, d = Math.hypot(dx, dy), max = 188;
      pos = d > max ? { x: C.x + dx / d * max, y: C.y + dy / d * max } : { x: p.x, y: p.y };
      nuc.setAttribute('transform', `translate(${pos.x},${pos.y})`);
    });
    nuc.addEventListener('pointerup', async () => {
      if (!drag) return;
      drag = false;
      if (Math.hypot(pos.x - C.x, pos.y - C.y) > EGG_R + 22) {
        solved = true;
        n++;
        k.chip(`Eggs enucleated: ${n} of ${TOT}`);
        const from = { ...pos };
        const pill = s('g', { class: 'pop' }, m.layer);
        s('rect', { x: C.x - 62, y: 372, width: 124, height: 26, rx: 4, fill: '#2b7a4b' }, pill);
        s('text', { x: C.x, y: 390, 'text-anchor': 'middle', class: 'sc-white' }, pill, 'Enucleated');
        await K.anim(700, e => {
          nuc.setAttribute('transform', `translate(${from.x + 190 * e},${from.y - 20 * e}) scale(${1 - .7 * e})`);
          nuc.setAttribute('opacity', 1 - e);
        });
        nuc.remove();
        k.say(`Nucleus removed from egg ${n}.`, 'good');
        await K.wait(500);
        if (n < TOT) drawEgg();
        else k.finish('All three eggs enucleated. They are now empty recipient cells with no nuclear DNA, ready to receive the donor\'s.');
      } else {
        pos = { ...start };
        nuc.setAttribute('transform', `translate(${start.x},${start.y})`);
        k.say('The nucleus is still inside. Drag it all the way out of the egg.', 'bad');
      }
    });
  }
  drawEgg();
}

/* ---------- 3. biopsy ---------- */
function step3(box, next) {
  const k = K.shell(box, head(3, 'Take cells from the animal to be cloned',
    'This is the sheep we want to copy. Any body (somatic) cell with a nucleus holds her complete set of genes. Dolly\'s cells came from the mammary gland, so click the glowing area on the udder to take a small sample.'), next);
  const svg = s('svg', { viewBox: '0 0 800 420' }, k.stage);
  const sh = K.sheep(svg, { x: 250, y: 190, s: 2.3, face: '#f1ece0', udder: true });
  s('text', { x: 250, y: 395, 'text-anchor': 'middle', class: 'sc-label' }, svg, 'Donor ewe (the sheep to be cloned)');
  s('circle', { cx: 650, cy: 215, r: 90, fill: '#f4f7f6', stroke: '#8a979f', 'stroke-width': 3 }, svg);
  s('text', { x: 650, y: 335, 'text-anchor': 'middle', class: 'sc-label' }, svg, 'Culture dish');
  const t = s('g', { class: 'hot' }, sh);
  s('circle', { cx: -22, cy: 33, r: 20, fill: 'rgba(31,95,115,.12)', stroke: '#1f5f73', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', class: 'target-pulse hl' }, t);
  let done = false;
  t.addEventListener('click', async () => {
    if (done) return;
    done = true;
    t.style.display = 'none';
    k.say('Sample taken.', 'good');
    const pos = [[620, 195], [678, 205], [645, 250]];
    for (const [x, y] of pos) {
      const c = s('g', { class: 'pop' }, svg);
      s('circle', { cx: x, cy: y, r: 17, fill: '#e8b7b0', stroke: '#b97c74', 'stroke-width': 2 }, c);
      s('circle', { cx: x, cy: y, r: 6, fill: '#6573b0' }, c);
      await K.wait(260);
    }
    k.finish('Somatic cells collected. Each has a nucleus holding all of the donor\'s DNA.');
  });
}

/* ---------- 4. culture and starve ---------- */
function step4(box, next) {
  const k = K.shell(box, head(4, 'Grow the cells, then starve them',
    'First the cells are cultured so there are plenty to work with. Then the nutrients are cut back. This pauses the cell cycle (the G0 phase), which makes the nucleus compatible with an egg. This was a key breakthrough behind Dolly.'), next);
  const svg = s('svg', { viewBox: '0 0 800 420' }, k.stage);
  const dish = s('circle', { cx: 400, cy: 205, r: 165, fill: '#f4d6da', stroke: '#8a979f', 'stroke-width': 4 }, svg);
  s('circle', { cx: 400, cy: 205, r: 150, fill: 'none', stroke: 'rgba(0,0,0,.08)', 'stroke-width': 2 }, svg);
  const label = s('text', { x: 400, y: 410, 'text-anchor': 'middle', class: 'sc-label' }, svg, 'Culture dish: rich growth medium needed');
  const cells = [];
  const pos = i => { const a = i * 2.4, r = Math.sqrt(i + .6) * 36; return [400 + Math.cos(a) * r, 205 + Math.sin(a) * r]; };
  function addCell(i, live) {
    const [x, y] = pos(i);
    const g = s('g', { class: 'pop' }, svg);
    const body = s('circle', { cx: x, cy: y, r: 17, fill: '#e8b7b0', stroke: '#b97c74', 'stroke-width': 2 }, g);
    s('circle', { cx: x, cy: y, r: 6, fill: '#6573b0' }, g);
    cells.push({ g, body });
    return g;
  }
  for (let i = 0; i < 3; i++) addCell(i);
  k.chip('3 cells');
  const b1 = K.toolBtn(k, 'Add growth medium', async () => {
    b1.disabled = true;
    dish.setAttribute('fill', '#f1c7ce');
    label.textContent = 'Cells dividing in rich medium';
    cells.forEach(c => c.g.classList.add('live'));
    for (let i = 3; i < 14; i++) {
      await K.wait(170);
      addCell(i).classList.add('live');
      cells[i].g.classList.add('live');
      k.chip(`${i + 1} cells, dividing`);
    }
    b2.hidden = false;
    k.say('Plenty of cells. Now pause their growth.');
  });
  const b2 = K.toolBtn(k, 'Starve the cells (reduce nutrients)', async () => {
    b2.disabled = true;
    dish.setAttribute('fill', '#efe9dc');
    label.textContent = 'Cells in G0: resting, not dividing';
    cells.forEach(c => {
      c.g.classList.remove('live');
      c.body.setAttribute('fill', '#cdd6dc');
      c.body.setAttribute('stroke', '#8a97a3');
    });
    k.chip('14 cells in G0 (quiescent)');
    k.finish('The cells have stopped dividing and are in G0. Their nuclei can now be reprogrammed by the egg.');
  });
  b2.hidden = true;
}

/* ---------- 5. transfer ---------- */
function step5(box, next) {
  const k = K.shell(box, head(5, 'Place a donor cell next to the egg',
    'A resting donor cell is moved beneath the protective outer layer (zona pellucida) of an enucleated egg, right beside its membrane. Click the donor cell and drag it onto the egg.'), next);
  const m = K.microscope(k.stage);
  const E = { x: 470, y: 220 };
  K.holder(m.layer, E.x - 122, E.y);
  K.egg(m.layer, E.x, E.y, false, 31);
  s('text', { x: E.x, y: 372, 'text-anchor': 'middle', class: 'sc-note lt' }, m.layer, 'Enucleated egg (no nucleus)');
  const donor = s('g', { transform: 'translate(275,105)', class: 'grab' }, m.layer);
  s('circle', { r: 28, fill: '#cdd6dc', stroke: '#8a97a3', 'stroke-width': 2.5 }, donor);
  K.nucleus(donor, 0, 0, 11);
  const lab = s('text', { x: 275, y: 150, 'text-anchor': 'middle', class: 'sc-note lt' }, m.layer, 'Donor cell (G0)');
  let drag = false, pos = { x: 275, y: 105 }, solved = false;
  donor.addEventListener('pointerdown', ev => { if (solved) return; ev.preventDefault(); try { donor.setPointerCapture(ev.pointerId); } catch (_) {} drag = true; lab.remove(); });
  donor.addEventListener('pointermove', ev => {
    if (!drag) return;
    const p = pt(m.svg, ev);
    const dx = p.x - 400, dy = p.y - 220, d = Math.hypot(dx, dy), max = 178;
    pos = d > max ? { x: 400 + dx / d * max, y: 220 + dy / d * max } : { x: p.x, y: p.y };
    donor.setAttribute('transform', `translate(${pos.x},${pos.y})`);
  });
  donor.addEventListener('pointerup', () => {
    if (!drag) return;
    drag = false;
    const dx = pos.x - E.x, dy = pos.y - E.y, d = Math.hypot(dx, dy);
    if (d < EGG_R + 68) {
      solved = true;
      const u = d ? { x: dx / d, y: dy / d } : { x: -1, y: 0 };
      donor.setAttribute('transform', `translate(${E.x + u.x * 110},${E.y + u.y * 110})`);
      donor.classList.remove('grab');
      k.chip('Donor cell inside the zona');
      k.finish('The donor cell now sits right beside the enucleated egg. Next they have to be fused.');
    } else {
      k.say('Move the donor cell right up against the egg.', 'bad');
    }
  });
}

/* ---------- 6. fuse and activate ---------- */
function blasto(n) {
  if (n === 1) return [[0, 0, 88]];
  if (n === 2) return [[-48, 0, 48], [48, 0, 48]];
  if (n === 4) return [[-42, -42, 40], [42, -42, 40], [-42, 42, 40], [42, 42, 40]];
  const out = [[0, 0, 26]];
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; out.push([Math.cos(a) * 62, Math.sin(a) * 62, 26]); }
  return out;
}
function step6(box, next) {
  const k = K.shell(box, head(6, 'Fuse the cells with an electric pulse',
    'A brief electric pulse does two jobs. It makes the membranes of the donor cell and the egg merge, so the donor nucleus ends up inside the egg. It also activates the egg, tricking it into behaving as if it had been fertilised.'), next);
  const m = K.microscope(k.stage);
  const E = { x: 400, y: 220 };
  K.egg(m.layer, E.x, E.y, false, 31);
  const el1 = s('rect', { x: 232, y: 60, width: 12, height: 320, fill: '#6b7782' }, m.layer);
  const el2 = s('rect', { x: 556, y: 60, width: 12, height: 320, fill: '#6b7782' }, m.layer);
  s('text', { x: 238, y: 110, 'text-anchor': 'middle', class: 'sc-note lt' }, m.layer, '+');
  s('text', { x: 562, y: 110, 'text-anchor': 'middle', class: 'sc-note lt' }, m.layer, '-');
  const donor = s('g', { transform: `translate(${E.x - 110},${E.y})` }, m.layer);
  const body = s('circle', { r: 28, fill: '#cdd6dc', stroke: '#8a97a3', 'stroke-width': 2.5 }, donor);
  const nuc = K.nucleus(m.layer, E.x - 110, E.y, 11);
  const flash = s('circle', { cx: 400, cy: 220, r: 205, fill: '#fff', opacity: 0, 'pointer-events': 'none' }, m.layer);
  const bolts = [0, 1, 2].map(i => s('polyline', { points: `244,${150 + i * 70} 290,${135 + i * 70} 330,${165 + i * 70} 370,${140 + i * 70} 410,${170 + i * 70} 450,${142 + i * 70} 500,${168 + i * 70} 556,${150 + i * 70}`, fill: 'none', stroke: '#ffcf3a', 'stroke-width': 3, opacity: 0 }, m.layer));
  const stage = s('text', { x: 400, y: 98, 'text-anchor': 'middle', class: 'sc-note lt' }, m.layer, 'Donor cell beside the enucleated egg');
  const btn = K.toolBtn(k, 'Apply electric pulse', async () => {
    btn.disabled = true;
    el1.setAttribute('fill', '#ffcf3a'); el2.setAttribute('fill', '#ffcf3a');
    for (let r = 0; r < 4; r++) {
      bolts.forEach(b => b.setAttribute('opacity', 1));
      flash.setAttribute('opacity', .55);
      await K.wait(70);
      bolts.forEach(b => b.setAttribute('opacity', 0));
      flash.setAttribute('opacity', 0);
      await K.wait(90);
    }
    el1.setAttribute('fill', '#6b7782'); el2.setAttribute('fill', '#6b7782');
    stage.textContent = 'Membranes fusing';
    await K.anim(1100, e => {
      donor.setAttribute('transform', `translate(${E.x - 110 + 70 * e},${E.y})`);
      body.setAttribute('opacity', 1 - e);
      nuc.setAttribute('transform', `translate(${E.x - 110 + 104 * e},${E.y - 8 * e})`);
    });
    donor.remove();
    stage.textContent = 'Fused and activated: the egg now holds the donor nucleus';
    k.say('Fusion complete.', 'good');
    await K.wait(1100);
    nuc.remove();
    const grp = s('g', {}, m.layer);
    for (const n of [1, 2, 4, 8]) {
      grp.innerHTML = '';
      blasto(n).forEach(([dx, dy, r]) => {
        s('circle', { cx: E.x + dx, cy: E.y + dy, r, fill: '#f2d3c7', stroke: '#c4948a', 'stroke-width': 2, class: 'pop' }, grp);
        s('circle', { cx: E.x + dx, cy: E.y + dy, r: Math.max(5, r * .26), fill: '#6573b0' }, grp);
      });
      stage.textContent = n === 1 ? 'Embryo: 1 cell' : `Embryo: ${n} cells`;
      k.chip(n === 1 ? 'Day 0: 1 cell' : `${n}-cell embryo`);
      await K.wait(1200);
    }
    stage.textContent = 'Embryo growing in the lab';
    k.finish('The embryo divides by mitosis and is grown for about six days. Every cell carries the donor\'s DNA.');
  });
}

/* ---------- 7. implant ---------- */
function step7(box, next) {
  const k = K.shell(box, head(7, 'Implant the embryo into a surrogate',
    'The embryo is placed in the uterus of a surrogate ewe. She carries the lamb to term, but she is not genetically related to it. Click the glowing uterus to implant the embryo.'), next);
  const svg = s('svg', { viewBox: '0 0 800 420' }, k.stage);
  K.sheep(svg, { x: 180, y: 170, s: 2, face: '#3d3a37' });
  s('text', { x: 180, y: 330, 'text-anchor': 'middle', class: 'sc-label' }, svg, 'Surrogate ewe');
  const X = 640;
  s('text', { x: X, y: 40, 'text-anchor': 'middle', class: 'sc-label' }, svg, 'Surrogate reproductive tract');
  [['M', X - 28, X - 100], ['M', X + 28, X + 100]].forEach(([_, x0, x1]) => {
    s('path', { d: `M${X + (x0 - X) * .3} 238 Q${x0} 170 ${x1} 140`, fill: 'none', stroke: '#b97c74', 'stroke-width': 32, 'stroke-linecap': 'round' }, svg);
  });
  [['M', X - 28, X - 100], ['M', X + 28, X + 100]].forEach(([_, x0, x1]) => {
    s('path', { d: `M${X + (x0 - X) * .3} 238 Q${x0} 170 ${x1} 140`, fill: 'none', stroke: '#eab9b3', 'stroke-width': 26, 'stroke-linecap': 'round' }, svg);
  });
  s('rect', { x: X - 27, y: 222, width: 54, height: 84, rx: 24, fill: '#eab9b3', stroke: '#b97c74', 'stroke-width': 3 }, svg);
  s('circle', { cx: X - 108, cy: 132, r: 17, fill: '#e6bfae', stroke: '#b98777', 'stroke-width': 2 }, svg);
  s('circle', { cx: X + 108, cy: 132, r: 17, fill: '#e6bfae', stroke: '#b98777', 'stroke-width': 2 }, svg);
  s('text', { x: X + 38, y: 300, class: 'sc-note' }, svg, 'uterus');
  const emb = s('g', { transform: 'translate(730,350)' }, svg);
  s('circle', { r: 17, fill: '#f2d3c7', stroke: '#c4948a', 'stroke-width': 2 }, emb);
  [[-6, -5], [6, -5], [-6, 6], [6, 6]].forEach(([x, y]) => s('circle', { cx: x, cy: y, r: 5, fill: '#6573b0' }, emb));
  s('text', { x: 730, y: 390, 'text-anchor': 'middle', class: 'sc-note' }, svg, 'Embryo from step 6');
  const t = s('g', { class: 'hot' }, svg);
  s('circle', { cx: X, cy: 262, r: 44, fill: 'rgba(31,95,115,.1)', stroke: '#65468a', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', class: 'target-pulse hl' }, t);
  let done = false;
  t.addEventListener('click', async () => {
    if (done) return;
    done = true;
    t.style.display = 'none';
    await K.anim(900, e => emb.setAttribute('transform', `translate(${730 + (X - 730) * e},${350 + (262 - 350) * e})`));
    k.say('Embryo implanted. Now we wait.', 'good');
    await K.wait(500);
    await K.anim(3200, (e) => k.chip(`Pregnancy: day ${Math.round(e * 148)} of 148`));
    const lamb = s('g', { class: 'pop' }, svg);
    K.sheep(lamb, { x: 420, y: 290, s: .8, face: '#f1ece0' });
    s('text', { x: 440, y: 395, 'text-anchor': 'middle', class: 'sc-big' }, lamb, 'Dolly, 5 July 1996');
    k.finish('Dolly is born. She has a white face like her donor, not a dark face like her surrogate, because her DNA came from the donor cell.');
  });
}

/* ---------- Dolly timeline ---------- */
function timeline(box, next) {
  const EV = [
    ['1996', 'Dolly is born', 'The first mammal cloned from an adult body cell. She was born at the Roslin Institute in Scotland on 5 July.'],
    ['1998', 'She has a lamb', 'Dolly gave birth to a lamb called Bonnie, showing that a clone can breed normally.'],
    ['2001 to 2002', 'Arthritis', 'Dolly developed arthritis at about five years old, early for a sheep that can live to 11 or 12.'],
    ['2003', 'Euthanised aged six', 'She had a progressive lung disease. Scientists debated whether being a clone played any part, and some reported unusually short telomeres.']
  ];
  const w = el('div');
  w.appendChild(el('div', 'kicker', 'Case study'));
  w.appendChild(el('h2', 'sec-h', 'The life of Dolly'));
  w.appendChild(el('p', 'lead', 'Select the button to reveal each event.'));
  const tl = el('div', 'tl');
  w.appendChild(tl);
  let i = 0;
  const acts = el('div', 'actions');
  const more = el('button', 'btn', 'Reveal first event');
  const go = el('button', 'btn', 'Continue');
  go.hidden = true; go.onclick = next;
  more.onclick = () => {
    const [yr, t, d] = EV[i++];
    const item = el('div', 'tl-item', `<div class="yr">${yr}</div><h3>${t}</h3><p>${d}</p>`);
    tl.appendChild(item);
    if (i < EV.length) more.textContent = 'Next event';
    else { more.hidden = true; go.hidden = false; }
  };
  acts.append(more, go);
  w.appendChild(acts);
  box.appendChild(w);
}

BioLab.register({
  id: 's3', num: 3, built: true,
  title: 'Cloning',
  short: 'Run the lab that made Dolly the sheep.',
  color: '#65468a',
  doneLine: 'You have walked through every step of somatic cell nuclear transfer.',
  summary: {
    what: 'Somatic cell nuclear transfer (SCNT): a body cell is fused with an egg that has had its nucleus removed, the egg is activated with an electric pulse, grown into an embryo and implanted into a surrogate.',
    adv: ['Copies animals with elite traits', 'Preserves genetics of endangered species', 'Produces animals for medical research'],
    dis: ['Very low success rate', 'Clones may have health problems', 'Reduces genetic diversity', 'High cost and ethical concerns'],
    ex: ['Dolly the sheep (1996)', 'Snuppy the dog (2005)', 'Cloned polo horses']
  },
  steps: [
    {
      type: 'hook',
      line: 'In 1996, scientists made a sheep from <em>one cell</em>.',
      sub: 'Today you are going to run that experiment yourself.',
      image: 's3_hero', imageLabel: 'Dolly the sheep',
      button: 'Enter the lab'
    },
    {
      type: 'learn', kicker: 'Before you start',
      cards: [
        { title: 'A clone is a genetic copy', text: 'A <b>clone</b> is an organism with the same DNA as another. Dolly was made using <b>somatic cell nuclear transfer (SCNT)</b>: swapping the nucleus of an egg for the nucleus of a body cell.' },
        { title: 'Three sheep, three jobs', text: 'One sheep gives a <b>body cell</b> (the DNA). A second gives an <b>egg</b> (just the cell, with its own DNA removed). A third, the <b>surrogate</b>, carries the embryo. The lamb is a copy of the first sheep only.' }
      ]
    },
    { type: 'activity', title: 'Collect eggs', render: step1 },
    { type: 'activity', title: 'Enucleate', render: step2 },
    { type: 'activity', title: 'Donor cells', render: step3 },
    { type: 'activity', title: 'Starve', render: step4 },
    { type: 'activity', title: 'Transfer', render: step5 },
    { type: 'activity', title: 'Fuse', render: step6 },
    { type: 'activity', title: 'Implant', render: step7 },
    { type: 'activity', title: 'Timeline', render: timeline },
    {
      type: 'flip', kind: 'adv', kicker: 'Why do it', title: 'Advantages of cloning',
      cards: [
        { title: 'Copies elite animals', text: 'A prize breeding animal can be reproduced with all its valuable traits.' },
        { title: 'Preserves endangered genetics', text: 'Cells from rare animals can be used to produce new individuals.' },
        { title: 'Research models', text: 'Genetically identical animals give cleaner results in medical research.' },
        { title: 'Multiplies rare traits', text: 'Animals with unusual, useful traits, such as those producing medicines, can be duplicated.' }
      ]
    },
    {
      type: 'flip', kind: 'dis', kicker: 'The catch', title: 'Disadvantages of cloning',
      cards: [
        { title: 'Very low success rate', text: 'Dolly was the only live birth from hundreds of attempts. Most embryos fail.' },
        { title: 'Health problems', text: 'Clones can suffer abnormal development and may age early.' },
        { title: 'Reduces genetic diversity', text: 'Identical animals share the same weaknesses, such as disease susceptibility.' },
        { title: 'Cost and ethics', text: 'The process is expensive, and many people question whether it is right.' }
      ]
    },
    {
      type: 'examples', kicker: 'Real world', title: 'Cloned animals',
      items: [
        { image: 's3_ex_dolly', imageLabel: 'Dolly the sheep, 1996', title: 'Dolly the sheep', text: 'The first mammal cloned from an adult body cell, in 1996.' },
        { image: 's3_ex_snuppy', imageLabel: 'Snuppy, the first cloned dog', title: 'Snuppy the dog', text: 'An Afghan hound, the first cloned dog, produced in South Korea in 2005.' },
        { image: 's3_ex_polo', imageLabel: 'Cloned polo horses', title: 'Polo horses', text: 'Champion polo horses have been cloned so their genetics stay in competition.' }
      ]
    },
    {
      type: 'quiz',
      questions: [
        { q: 'What does SCNT stand for?', options: ['Somatic cell nuclear transfer', 'Selective cell nucleus treatment', 'Single cell nuclear tissue', 'Somatic chromosome nuclear transplant'], answer: 0, explain: 'Somatic cell nuclear transfer: the nucleus of a body (somatic) cell is transferred into an egg.' },
        { q: 'Why is the egg\'s own nucleus removed before the donor cell is added?', options: ['So the clone carries only the donor\'s DNA', 'Eggs cannot divide with a nucleus', 'It makes the egg larger', 'To stop the egg from being activated'], answer: 0, explain: 'If the egg\'s nucleus stayed, the embryo would have DNA from two animals and would not be a clone.' },
        { q: 'Which finding raised concerns about premature ageing in Dolly?', options: ['Shorter telomeres than expected for her age', 'Extra chromosomes', 'She was unable to have lambs', 'She had no immune system'], answer: 0, explain: 'Some studies reported that Dolly\'s telomeres were shorter than those of normal sheep her age, though the cause of her illness is still debated.' }
      ]
    }
  ]
});
})();
