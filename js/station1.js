(function () {
const { el, shuffle } = BioLab;
const { s } = SVGKit;
const K = SimKit;

/* ---------- insemination practical ---------- */
const COW = {
  name: 'Daisy', breed: 'Holstein-Friesian', image: 's1_cow',
  tags: ['Black and white coat', 'Lean dairy build', 'Very high milk yield', 'Calm temperament']
};
const BULLS = [
  {
    id: 'holstein', name: 'Duke', breed: 'Holstein-Friesian', col: '#c0392b',
    tags: ['Black and white coat', 'Lean dairy build', 'Daughters give very high milk yield', 'Calm temperament'],
    calfTags: ['Black and white coat', 'Lean dairy build', 'High milk potential'],
    note: 'Both parents are Holsteins, so the calf looks like a typical Holstein and is bred for milk.'
  },
  {
    id: 'angus', name: 'Barney', breed: 'Angus', col: '#2e86c1',
    tags: ['Solid black coat', 'Heavy muscling (beef)', 'Fast growth', 'Hornless (polled)'],
    calfTags: ['Mostly black coat', 'Muscular dairy-beef build', 'Faster growth, lower milk potential', 'Hornless'],
    note: 'The Angus line passes on a mostly black coat, hornlessness and extra muscle. This calf is a dairy-beef cross.'
  },
  {
    id: 'hereford', name: 'Maximus', breed: 'Hereford', col: '#27ae60',
    tags: ['Red body with a white face', 'Heavy muscling (beef)', 'Hardy in tough conditions', 'Efficient feed use'],
    calfTags: ['Black body with a white face', 'Muscular dairy-beef build', 'Hardy, lower milk potential'],
    note: 'The Hereford white face is passed on strongly, so the calf has a dark body with a white face, plus the beef build.'
  },
  {
    id: 'jersey', name: 'Rusty', breed: 'Jersey', col: '#d4ac0d',
    tags: ['Fawn (light brown) coat', 'Small, fine-boned frame', 'Very high butterfat milk', 'Fertile, easy calving'],
    calfTags: ['Brown and white patches', 'Smaller, finer frame', 'Milk rich in butterfat'],
    note: 'The calf blends both parents: smaller and finer than a Holstein, with a browner coat and richer milk potential.'
  }
];

function strawSVG(col) {
  const svg = s('svg', { viewBox: '0 0 40 110', class: 'straw' });
  s('rect', { x: 15, y: 12, width: 10, height: 86, rx: 4, fill: 'rgba(255,255,255,.7)', stroke: '#5c6b78', 'stroke-width': 1.8 }, svg);
  s('rect', { x: 16.5, y: 44, width: 7, height: 52, rx: 3, fill: '#f1e3b8' }, svg);
  s('rect', { x: 13, y: 4, width: 14, height: 14, rx: 3, fill: col, stroke: 'rgba(0,0,0,.3)' }, svg);
  return svg;
}

function thumb(id, label) {
  return BioLab.imgSlot(id, label, 'sq', 'thumb');
}
const tagHTML = a => a.map(t => `<span class="tag">${t}</span>`).join('');

function inseminate(box, next) {
  const k = K.shell(box, {
    kicker: 'Activity',
    title: 'Inseminate a cow',
    brief: `Meet <b>${COW.name}</b>, a dairy cow ready to be inseminated. Semen from four bulls is stored in the liquid nitrogen tank. Choose a straw, inseminate ${COW.name}, and see what her calf looks like. You can then go back, choose a different straw, and compare the calves.`
  }, next);
  const area = el('div');
  k.stage.appendChild(area);
  const tried = [];

  function pick() {
    area.innerHTML = '';
    k.tools.innerHTML = '';
    k.say('');
    k.reset();
    k.chip(tried.length ? `Calves compared: ${tried.length} of ${BULLS.length}` : `The cow: ${COW.name}`);
    const cow = el('div', 'cowcard');
    cow.appendChild(thumb(COW.image, `${COW.name}, a ${COW.breed} dairy cow`));
    cow.appendChild(el('div', 'cow-info', `<h3>The cow: ${COW.name}</h3><p>${COW.breed}</p><div class="tagrow">${tagHTML(COW.tags)}</div>`));
    area.appendChild(cow);
    area.appendChild(el('p', 'phase', '<b>Step 1 of 2.</b> Read the qualities of each bull, then select the straw you want to use.'));
    const grid = el('div', 'plants two');
    let chosen = null;
    const go = K.toolBtn(k, 'Take sample to the cow', () => inject(chosen));
    go.disabled = true;
    const cards = BULLS.map(b => {
      const c = el('button', 'plant bull');
      if (tried.includes(b)) c.dataset.role = 'Tried';
      c.appendChild(thumb(`s1_bull_${b.id}`, `${b.breed} bull`));
      const head = el('div', 'bull-head');
      head.appendChild(strawSVG(b.col));
      head.appendChild(el('b', '', `Bull: ${b.name}<small>${b.breed}</small>`));
      c.appendChild(head);
      c.appendChild(el('div', 'tagrow', tagHTML(b.tags)));
      c.onclick = () => {
        chosen = b;
        cards.forEach(x => { const on = x.b === b; x.c.classList.toggle('sel', on); x.c.dataset.role = on ? 'Selected' : (tried.includes(x.b) ? 'Tried' : ''); });
        go.disabled = false;
      };
      grid.appendChild(c);
      return { c, b };
    });
    area.appendChild(grid);
  }

  function inject(bull) {
    area.innerHTML = '';
    k.tools.innerHTML = '';
    k.chip(`Sample: bull ${bull.name} (${bull.breed})`);
    area.appendChild(el('p', 'phase', '<b>Step 2 of 2.</b> The technician passes the gun through the cervix and deposits the semen just past it, in the uterine body. Click the glowing target.'));
    const svg = s('svg', { viewBox: '0 0 800 320', style: 'max-width:800px' });
    area.appendChild(svg);
    const wrong = msg => () => k.say(msg, 'bad');
    const pink = '#eab9b3', edge = '#b97c74';
    [['M450 150 Q530 108 600 66', 'M600 66 Q640 44 668 66'], ['M450 186 Q530 228 600 270', 'M600 270 Q640 292 668 270']].forEach(([horn, tube]) => {
      s('path', { d: horn, fill: 'none', stroke: edge, 'stroke-width': 40, 'stroke-linecap': 'round' }, svg);
      s('path', { d: tube, fill: 'none', stroke: edge, 'stroke-width': 7, 'stroke-linecap': 'round' }, svg);
    });
    ['M450 150 Q530 108 600 66', 'M450 186 Q530 228 600 270'].forEach(d => {
      const p = s('path', { d, fill: 'none', stroke: pink, 'stroke-width': 32, 'stroke-linecap': 'round' }, svg);
      p.addEventListener('click', wrong('Too far. The semen is deposited in the uterine body, just past the cervix. The sperm swim on from there.'));
    });
    [[690, 60], [690, 276]].forEach(([x, y]) => { const o = s('circle', { cx: x, cy: y, r: 24, fill: '#e6bfae', stroke: '#b98777', 'stroke-width': 2 }, svg); o.addEventListener('click', wrong('That is the ovary. The gun never goes this far.')); });
    const vag = s('rect', { x: 70, y: 146, width: 240, height: 46, rx: 22, fill: pink, stroke: edge, 'stroke-width': 3 }, svg);
    vag.addEventListener('click', wrong('That is the vagina. Semen placed here is too far from the egg. The gun must pass through the cervix.'));
    const cerv = s('rect', { x: 300, y: 134, width: 58, height: 70, rx: 10, fill: '#dc958e', stroke: edge, 'stroke-width': 3 }, svg);
    [314, 329, 344].forEach(x => s('line', { x1: x, y1: 140, x2: x, y2: 198, stroke: edge, 'stroke-width': 2, 'pointer-events': 'none' }, svg));
    cerv.addEventListener('click', wrong('That is the cervix, a tight muscular ring. The gun passes through it and deposits the semen just beyond.'));
    s('rect', { x: 352, y: 126, width: 112, height: 82, rx: 26, fill: pink, stroke: edge, 'stroke-width': 3 }, svg);
    [['Vagina', 190, 232], ['Cervix', 329, 232], ['Uterine body', 408, 232], ['Uterine horn', 540, 60], ['Ovary', 690, 20]].forEach(([t, x, y]) => s('text', { x, y, 'text-anchor': 'middle', class: 'sc-note lt', 'pointer-events': 'none' }, svg, t));
    const gun = s('g', { 'pointer-events': 'none' }, svg);
    s('rect', { x: 6, y: 154, width: 20, height: 30, rx: 4, fill: '#46515c' }, gun);
    s('rect', { x: 24, y: 164, width: 196, height: 10, fill: '#7b8794' }, gun);
    s('rect', { x: 218, y: 165, width: 62, height: 8, rx: 3, fill: bull.col, stroke: 'rgba(0,0,0,.3)' }, gun);
    const t = s('g', { class: 'hot' }, svg);
    s('rect', { x: 372, y: 140, width: 72, height: 54, rx: 20, fill: 'rgba(31,95,115,.14)', stroke: '#1f5f73', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', class: 'target-pulse hl' }, t);
    let done = false;
    t.addEventListener('click', async () => {
      if (done) return;
      done = true;
      t.style.display = 'none';
      await K.anim(900, e => gun.setAttribute('transform', `translate(${140 * e},0)`));
      k.say('Semen deposited in the uterine body.', 'good');
      const sp = Array.from({ length: 14 }, (_, i) => s('circle', { cx: 420 + (i % 4) * 5, cy: 152 + (i % 5) * 9, r: 3.4, fill: '#2c3e50', class: 'pop' }, svg));
      await K.wait(500);
      await K.anim(900, e => gun.setAttribute('transform', `translate(${140 - 140 * e},0)`));
      k.chip('Sperm swimming towards the egg');
      const sx = sp.map(c => [parseFloat(c.getAttribute('cx')), parseFloat(c.getAttribute('cy'))]);
      await K.anim(1800, e => sp.forEach((c, i) => {
        const up = i % 2 === 0, tx = 640 + (i % 3) * 6, ty = (up ? 66 : 270) + (i % 3) * 3;
        const mx = sx[i][0] + (tx - sx[i][0]) * e;
        const base = sx[i][1] + ((up ? 100 : 218) - sx[i][1]) * Math.min(1, e * 2);
        const my = e < .5 ? base : base + (ty - base) * ((e - .5) * 2);
        c.setAttribute('cx', mx); c.setAttribute('cy', my);
      }));
      k.chip('Fertilisation');
      await K.wait(900);
      await K.anim(3200, e => k.chip(`Pregnancy: day ${Math.round(e * 283)} of about 283`));
      result(bull);
    });
  }

  function result(bull) {
    if (!tried.includes(bull)) tried.push(bull);
    area.innerHTML = '';
    k.tools.innerHTML = '';
    k.chip(`Calves compared: ${tried.length} of ${BULLS.length}`);
    area.appendChild(el('p', 'phase', `<b>About 283 days later</b>, ${COW.name} gives birth. Here is her calf, sired by ${bull.name} (${bull.breed}).`));
    const w = el('div', 'calfwrap');
    w.appendChild(BioLab.imgSlot(`s1_calf_${bull.id}`, `Calf of ${COW.name} and ${bull.name}`, '', 'plain'));
    w.appendChild(el('div', 'calf-info', `<h3>${COW.name} × ${bull.name}</h3><div class="tagrow">${tagHTML(bull.calfTags)}</div><p>${bull.note}</p>`));
    area.appendChild(w);
    if (tried.length > 1) {
      area.appendChild(el('div', 'cmp-h', 'Compare your calves'));
      const cmp = el('div', 'cmp');
      tried.forEach(b => {
        const c = el('div', 'cmpc' + (b === bull ? ' cur' : ''));
        c.appendChild(thumb(`s1_calf_${b.id}`, `Calf of ${COW.name} and ${b.name}`));
        c.appendChild(el('b', '', `${COW.name} × ${b.name}`));
        c.appendChild(el('div', 'tagrow', tagHTML(b.calfTags)));
        cmp.appendChild(c);
      });
      area.appendChild(cmp);
    }
    if (tried.length < BULLS.length) K.toolBtn(k, 'Try a different straw', pick, true);
    k.finish(tried.length === 1
      ? `The calf inherits half its genes from ${COW.name} and half from the bull you chose. Try a different straw to compare, or continue.`
      : 'Same cow, different bull, a different calf. By choosing the straw, the farmer chooses half of the calf\'s genes, with no bull on the farm and no mating.');
  }
  pick();
}

/* ---------- drag-to-order activity ---------- */
function sequencer(box, next) {
  const STEPS = [
    { id: 1, t: 'Collect semen', d: 'Taken from the elite bull' },
    { id: 2, t: 'Evaluate and dilute', d: 'Check sperm quality, add a protective diluent' },
    { id: 3, t: 'Freeze and store', d: 'Straws kept in liquid nitrogen at -196°C' },
    { id: 4, t: 'Inseminate the female', d: 'Thawed semen placed in the cow at the right time in her cycle' }
  ];
  let order;
  do { order = shuffle(STEPS); } while (order.every((s, i) => s.id === i + 1));

  const w = el('div', 'seq-wrap');
  w.appendChild(el('div', 'kicker', 'Activity'));
  w.appendChild(el('h2', 'sec-h', 'Put the AI process in order'));
  w.appendChild(el('p', 'lead', 'Drag the cards into the right sequence, from the bull to the calf.'));
  const list = el('div', 'seq-list');
  const msg = el('div', 'msg');
  const check = el('button', 'btn', 'Check order');
  const go = el('button', 'btn', 'Continue');
  go.hidden = true;
  go.onclick = next;
  const acts = el('div', 'actions');
  acts.append(check, go);
  w.append(list, msg, acts);
  box.appendChild(w);

  const GAP = 10;
  const slots = STEPS.map((_, i) => list.appendChild(el('div', 'seq-slot', String(i + 1))));
  const cards = new Map();
  STEPS.forEach(s => {
    const c = el('div', 'seq-card', `<b>${s.t}</b><span>${s.d}</span>`);
    list.appendChild(c);
    cards.set(s.id, c);
  });

  let H = 0;
  cards.forEach(c => { H = Math.max(H, c.offsetHeight); });
  H = Math.max(H, 64);
  list.style.height = STEPS.length * H + (STEPS.length - 1) * GAP + 'px';
  slots.forEach((s, i) => { s.style.top = i * (H + GAP) + 'px'; s.style.height = H + 'px'; });
  cards.forEach(c => { c.style.height = H + 'px'; });

  const topOf = i => i * (H + GAP);
  function layout(skip) {
    order.forEach((s, i) => {
      const c = cards.get(s.id);
      if (c !== skip) c.style.top = topOf(i) + 'px';
    });
  }
  layout();

  let locked = false;
  cards.forEach((c, id) => {
    c.addEventListener('pointerdown', e => {
      if (locked) return;
      e.preventDefault();
      try { c.setPointerCapture(e.pointerId); } catch (_) {}
      cards.forEach(x => x.classList.remove('ok', 'no'));
      msg.textContent = ''; msg.className = 'msg';
      const startY = e.clientY;
      const startTop = topOf(order.findIndex(s => s.id === id));
      c.classList.add('drag');
      const max = topOf(STEPS.length - 1);
      const move = ev => {
        const y = Math.min(max, Math.max(0, startTop + ev.clientY - startY));
        c.style.top = y + 'px';
        const target = Math.round(y / (H + GAP));
        const cur = order.findIndex(s => s.id === id);
        if (target !== cur) {
          const [item] = order.splice(cur, 1);
          order.splice(target, 0, item);
          layout(c);
        }
      };
      const up = () => {
        c.removeEventListener('pointermove', move);
        c.removeEventListener('pointerup', up);
        c.removeEventListener('pointercancel', up);
        c.classList.remove('drag');
        layout();
      };
      c.addEventListener('pointermove', move);
      c.addEventListener('pointerup', up);
      c.addEventListener('pointercancel', up);
    });
  });

  check.onclick = () => {
    let right = 0;
    order.forEach((s, i) => {
      const ok = s.id === i + 1;
      if (ok) right++;
      const c = cards.get(s.id);
      c.classList.remove('ok', 'no');
      void c.offsetWidth;
      c.classList.add(ok ? 'ok' : 'no');
    });
    if (right === STEPS.length) {
      locked = true;
      cards.forEach(c => c.classList.add('lock'));
      msg.className = 'msg good';
      msg.textContent = 'Perfect order. The cold chain is what makes shipping sperm worldwide possible.';
      check.hidden = true;
      go.hidden = false;
    } else {
      msg.className = 'msg bad';
      msg.textContent = `${right} of ${STEPS.length} in the right place. Keep going.`;
    }
  };
}

BioLab.register({
  id: 's1', num: 1, built: true,
  title: 'Artificial Insemination',
  short: 'One bull, tens of thousands of calves. How?',
  color: '#1f5f73',
  doneLine: 'You now know how a single bull can improve herds on the other side of the world.',
  summary: {
    what: 'Semen is collected from a superior male, evaluated, diluted and frozen, then placed into the female reproductive tract by a technician (no mating needed).',
    adv: ['Spreads elite genetics widely', 'No animal transport needed', 'Long-term sperm storage', 'Reduces disease spread'],
    dis: ['Reduces genetic diversity', 'Needs skill and equipment', 'Timing is critical', 'Welfare and ethical concerns'],
    ex: ['Dairy cattle (Holstein)', 'Przewalski\'s horse conservation']
  },
  steps: [
    {
      type: 'hook',
      line: 'One bull.<br><em>Tens of thousands</em> of calves.',
      sub: 'No farm gate. No mating. How is that even possible?',
      image: 's1_hero', imageLabel: 'Holstein dairy cattle on a modern farm',
      button: 'Find out'
    },
    {
      type: 'guess',
      question: 'Quick guess before we start',
      lead: 'A bull mating naturally sires around 50 calves a year. With artificial insemination, how many can one elite bull sire in a year?',
      options: [
        { label: '500' },
        { label: '5,000' },
        { label: '50,000', correct: true }
      ],
      reveal: 'Elite bulls can sire up to around 50,000 calves a year, because one collection is split into hundreds of doses.'
    },
    {
      type: 'learn',
      kicker: 'How it works',
      total: 4,
      cards: [
        { title: 'No mating required', text: 'Artificial insemination (AI) means <b>collecting sperm</b> from a chosen male and <b>placing it in the female reproductive tract by hand</b>, using instruments.' }
      ]
    },
    { type: 'activity', title: 'Inseminate', render: (box, next) => inseminate(box, next) },
    {
      type: 'learn',
      kicker: 'How it works',
      total: 4,
      offset: 1,
      cards: [
        { title: 'Freeze it, ship it', text: 'Semen is mixed with a protective diluent and frozen in <b>liquid nitrogen at -196°C</b>. It stays viable for decades and can be shipped anywhere.' },
        { title: 'One male, many offspring', text: 'Farmers pick bulls with the best traits, like <b>milk yield, fertility and disease resistance</b>. One collection is split into many doses, so one bull fathers huge numbers of calves.' },
        { title: 'Not just cows', text: 'AI is used in <b>cattle, horses, pigs and sheep</b>, and in breeding programs that help save endangered species.' }
      ]
    },
    { type: 'activity', title: 'Sequence', render: (box, next) => sequencer(box, next) },
    {
      type: 'flip', kind: 'adv', kicker: 'Why farmers do it', title: 'Advantages of AI',
      cards: [
        { title: 'Spreads elite genetics widely', text: 'One top male can improve the traits of entire herds, fast.' },
        { title: 'No animal transport', text: 'Semen travels, not a 900 kg bull. Cheaper, safer and less stressful.' },
        { title: 'Long-term storage', text: 'Frozen sperm keeps genetics available for decades, even after the male has died.' },
        { title: 'Reduces disease spread', text: 'Semen is screened, and animals do not need physical contact.' }
      ]
    },
    {
      type: 'flip', kind: 'dis', kicker: 'The catch', title: 'Disadvantages of AI',
      cards: [
        { title: 'Reduces genetic diversity', text: 'If everyone uses the same few bulls, herds become genetically similar and more vulnerable to disease.' },
        { title: 'Needs skill and equipment', text: 'Trained technicians and liquid nitrogen tanks are required.' },
        { title: 'Timing is critical', text: 'The female must be inseminated at the right point in her cycle, or it fails.' },
        { title: 'Welfare and ethical concerns', text: 'Semen collection and bypassing natural mating raise animal welfare questions.' }
      ]
    },
    {
      type: 'examples', kicker: 'Real world', title: 'Where AI is used',
      items: [
        { image: 's1_ex_holstein', imageLabel: 'A Holstein dairy cow', title: 'Holstein dairy cattle', text: 'Most dairy herds in developed countries are bred using AI, with bulls selected for milk yield.' },
        { image: 's1_ex_horse', imageLabel: "Przewalski's horse, an endangered species", title: "Przewalski's horse", text: 'Stored semen is used to bring lost genetic diversity back into a tiny endangered population.' }
      ]
    },
    {
      type: 'quiz',
      questions: [
        { q: 'At what temperature is bull semen stored?', options: ['-196°C', '0°C', '-20°C', '4°C'], answer: 0, explain: 'Liquid nitrogen at -196°C stops all biological activity, so sperm survives for decades.' },
        { q: 'Why can widespread AI reduce genetic diversity?', options: ['One male\'s genes spread across a huge number of offspring', 'Frozen sperm mutates', 'Females reject sperm from unfamiliar males', 'Only one breed can be used'], answer: 0, explain: 'A few popular bulls father most calves, so the gene pool narrows.' },
        { q: 'True or false: AI requires animals to be transported between farms.', options: ['True', 'False'], answer: 1, shuffle: false, explain: 'False. Only the frozen semen is shipped, which is one of the big advantages.' }
      ]
    }
  ]
});
})();
