(function () {
const { el, shuffle } = BioLab;
const { s } = SVGKit;
const K = SimKit;

/* display labels for each trait value */
const TRAITS = {
  height: { label: { tall: 'Tall', short: 'Short' } },
  fruit: { label: { many: 'Many fruit', few: 'Few fruit' } },
  root: { label: { deep: 'Drought resistant', shallow: 'Not drought resistant' } },
  speed: { label: { fast: 'Fast growing', slow: 'Slow growing' } },
  disease: { label: { resistant: 'Disease resistant', susceptible: 'Disease susceptible' } },
  yield: { label: { high: 'High yield', low: 'Low yield' } },
  stem: { label: { stiff: 'Stiff stem', weak: 'Weak stem' } }
};

const SCENARIOS = [
  {
    title: 'Tomatoes: tall with lots of fruit',
    brief: 'A greenhouse grower wants a tomato variety that is <b>tall</b> (more room for trusses) and carries <b>many fruit</b>. None of the four varieties has both. Choose two parents and cross them.',
    attrs: ['height', 'fruit'],
    goal: { height: 'tall', fruit: 'many' },
    plants: [
      { name: 'Lofty', height: 'tall', fruit: 'few' },
      { name: 'Clusterberry', height: 'short', fruit: 'many' },
      { name: 'Stubby', height: 'short', fruit: 'few' },
      { name: 'Tallboy', height: 'tall', fruit: 'few' }
    ],
    success: 'Each parent supplied one of the traits you wanted, and this seedling inherited both.'
  },
  {
    title: 'Wheat: drought resistant and fast growing',
    brief: 'A wheat farmer on dry inland country needs a crop that is <b>drought resistant</b> and <b>fast growing</b>, so it matures before the dry spell. Choose two parents and cross them.',
    attrs: ['root', 'speed'],
    goal: { root: 'deep', speed: 'fast' },
    plants: [
      { name: 'Dryland', root: 'deep', speed: 'slow' },
      { name: 'Sprinter', root: 'shallow', speed: 'fast' },
      { name: 'Lowland', root: 'shallow', speed: 'slow' },
      { name: 'Steady', root: 'deep', speed: 'slow' }
    ],
    success: 'Breeders cross different varieties to bring useful traits together in one crop.'
  },
  {
    title: 'Barley: three traits at once',
    brief: 'A breeder wants barley that is <b>disease resistant</b>, <b>high yielding</b> and <b>stiff stemmed</b> (stiff stems resist being flattened by wind). Three goals, so choose carefully.',
    attrs: ['disease', 'yield', 'stem'],
    goal: { disease: 'resistant', yield: 'high', stem: 'stiff' },
    plants: [
      { name: 'Shield', disease: 'resistant', yield: 'low', stem: 'stiff' },
      { name: 'Harvest', disease: 'susceptible', yield: 'high', stem: 'weak' },
      { name: 'Titan', disease: 'resistant', yield: 'high', stem: 'weak' },
      { name: 'Dwarfling', disease: 'susceptible', yield: 'low', stem: 'stiff' }
    ],
    success: 'More than one pair of parents could have worked, as long as between them the parents carried every trait you needed.'
  }
];

function drawPlant(svg, t) {
  const g = s('g', {}, svg);
  const gy = 120;
  s('rect', { x: 8, y: gy, width: 104, height: 70, fill: '#e7dcc3' }, g);
  s('line', { x1: 8, y1: gy, x2: 112, y2: gy, stroke: '#8a6f46', 'stroke-width': 3 }, g);
  const rl = t.root === 'deep' ? 66 : t.root === 'shallow' ? 24 : 44;
  const root = { stroke: '#8a6f46', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' };
  s('path', { ...root, d: `M60 ${gy} L60 ${gy + rl}` }, g);
  s('path', { ...root, d: `M60 ${gy + 6} Q42 ${gy + rl * .5} 36 ${gy + rl * .8}` }, g);
  s('path', { ...root, d: `M60 ${gy + 6} Q78 ${gy + rl * .5} 84 ${gy + rl * .8}` }, g);
  const h = t.height === 'tall' ? 105 : t.height === 'short' ? 55 : 80;
  s('line', { x1: 60, y1: gy, x2: 60, y2: gy - h, stroke: '#5c8a4a', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
  [[.32, -1], [.55, 1], [.78, -1]].forEach(([f, side], i) => {
    const y = gy - h * f;
    s('ellipse', { cx: 60 + side * 17, cy: y, rx: 17, ry: 6, fill: '#7aa862', stroke: '#5c8a4a', transform: `rotate(${side * -20} ${60 + side * 17} ${y})` }, g);
    if (t.disease === 'susceptible') {
      s('circle', { cx: 60 + side * 20, cy: y, r: 2.6, fill: '#8a4b2a' }, g);
      s('circle', { cx: 60 + side * 13, cy: y + 1, r: 2, fill: '#8a4b2a' }, g);
    }
  });
  const many = t.fruit === 'many' || t.yield === 'high';
  const few = t.fruit === 'few' || t.yield === 'low';
  const nf = many ? 5 : few ? 2 : 3;
  const col = t.yield ? '#d9b44a' : '#d6452f';
  for (let i = 0; i < nf; i++) {
    s('circle', { cx: 60 + (i - (nf - 1) / 2) * 13, cy: gy - h - 6 + (i % 2) * 7, r: 6.5, fill: col, stroke: 'rgba(0,0,0,.25)' }, g);
  }
  return g;
}

function plantSVG(t) {
  const svg = s('svg', { viewBox: '0 0 120 190' });
  drawPlant(svg, t);
  return svg;
}

function tags(plant, attrs) {
  return attrs.map(a => `<span class="tag">${TRAITS[a].label[plant[a]]}</span>`).join('');
}

function bloom(svg, cx, cy) {
  const g = s('g', { transform: `translate(${cx},${cy}) scale(1.5)` }, svg);
  s('path', { d: 'M0 40 L0 110', stroke: '#5c8a4a', 'stroke-width': 5, fill: 'none' }, g);
  for (let i = 0; i < 6; i++) s('ellipse', { cx: 0, cy: -30, rx: 13, ry: 30, fill: '#efe7a6', stroke: '#b9ad5b', 'stroke-width': 1.5, transform: `rotate(${i * 60})` }, g);
  s('circle', { cx: 0, cy: 0, r: 15, fill: '#e2d887', stroke: '#b9ad5b' }, g);
  const anther = s('g', { class: 'hot' }, g);
  s('circle', { cx: 0, cy: -14, r: 12, fill: '#f2b52c', stroke: '#a8740b', 'stroke-width': 2, class: 'hl' }, anther);
  const dots = [[-5, -18], [4, -17], [0, -10], [-7, -10], [6, -9]].map(([x, y]) => s('circle', { cx: x, cy: y, r: 2, fill: '#fff3c0' }, anther));
  s('circle', { cx: 0, cy: -14, r: 20, fill: 'transparent' }, anther);
  const stigma = s('g', { class: 'hot' }, g);
  s('circle', { cx: 0, cy: 14, r: 9, fill: '#cfe3b8', stroke: '#6f9a55', 'stroke-width': 2, class: 'hl' }, stigma);
  s('circle', { cx: 0, cy: 14, r: 18, fill: 'transparent' }, stigma);
  s('text', { x: 20, y: -10, class: 'sc-note' }, g, 'anther');
  s('text', { x: 14, y: 22, class: 'sc-note' }, g, 'stigma');
  return { g, anther, stigma, dots };
}

function scenarioStep(sc, n) {
  return (box, next) => {
    const k = K.shell(box, {
      kicker: `Scenario ${n} of 3`,
      title: sc.title,
      brief: sc.brief + ' <i>Each offspring inherits a mix of traits from its two parents, so the seedlings will not all look alike.</i>'
    }, next);
    k.chip('Goal: ' + sc.attrs.map(a => TRAITS[a].label[sc.goal[a]]).join(' + '));
    const area = el('div');
    k.stage.appendChild(area);

    function choose() {
      area.innerHTML = '';
      k.tools.innerHTML = '';
      k.say('');
      area.appendChild(el('p', 'phase', '<b>Step 1 of 2.</b> Choose two parent plants. The first you pick supplies the pollen. The second receives it and will set the seed.'));
      const grid = el('div', 'plants');
      const picks = [];
      const go = K.toolBtn(k, 'Pollinate these parents', () => pollinate(picks[0], picks[1]));
      go.disabled = true;
      const cards = sc.plants.map(pl => {
        const b = el('button', 'plant');
        b.appendChild(plantSVG(pl));
        b.appendChild(el('b', '', pl.name));
        b.appendChild(el('div', 'tagrow', tags(pl, sc.attrs)));
        b.onclick = () => {
          const i = picks.indexOf(pl);
          if (i >= 0) picks.splice(i, 1);
          else if (picks.length < 2) picks.push(pl);
          else { k.say('You already have two parents. Select a chosen plant again to deselect it.', 'bad'); return; }
          cards.forEach(c => { const j = picks.indexOf(c.pl); c.b.classList.toggle('sel', j >= 0); c.b.dataset.role = j === 0 ? 'Pollen parent' : j === 1 ? 'Seed parent' : ''; });
          go.disabled = picks.length < 2;
          k.say('');
        };
        grid.appendChild(b);
        return { b, pl };
      });
      area.appendChild(grid);
    }

    function pollinate(p1, p2) {
      area.innerHTML = '';
      k.tools.innerHTML = '';
      area.appendChild(el('p', 'phase', '<b>Step 2 of 2.</b> Pollinate by hand. Remove the seed parent\'s own anthers so it cannot pollinate itself, collect pollen from the pollen parent, then brush it onto the seed parent\'s stigma.'));
      const svg = s('svg', { viewBox: '0 0 640 300', style: 'max-width:640px;margin:0 auto' });
      area.appendChild(svg);
      s('text', { x: 170, y: 28, 'text-anchor': 'middle', class: 'sc-label' }, svg, `Pollen parent: ${p1.name}`);
      s('text', { x: 470, y: 28, 'text-anchor': 'middle', class: 'sc-label' }, svg, `Seed parent: ${p2.name}`);
      const A = bloom(svg, 170, 130), B = bloom(svg, 470, 130);
      let removed = false, loaded = false, done = false;
      const upd = () => k.chip(`Goal: ${sc.attrs.map(a => TRAITS[a].label[sc.goal[a]]).join(' + ')}   |   Seed parent anthers: ${removed ? 'removed' : 'present'}   |   Stick: ${loaded ? 'loaded' : 'empty'}`);
      upd();
      B.anther.addEventListener('click', async () => {
        if (removed || done) return;
        removed = true;
        B.anther.style.pointerEvents = 'none';
        await K.anim(500, e => { B.anther.setAttribute('transform', `translate(${14 * e},${46 * e})`); B.anther.setAttribute('opacity', 1 - e); });
        B.anther.remove();
        upd();
        k.say('Anthers removed. This seed parent can no longer pollinate itself.', 'good');
      });
      A.anther.addEventListener('click', () => {
        if (loaded || done) return;
        loaded = true;
        A.dots.forEach(d => d.setAttribute('opacity', .15));
        upd();
        k.say('Pollen collected on your stick.', 'good');
      });
      A.stigma.addEventListener('click', () => k.say('That is the pollen parent. The pollen goes onto the seed parent\'s stigma.', 'bad'));
      B.stigma.addEventListener('click', async () => {
        if (done) return;
        if (!removed) { k.say('Remove the seed parent\'s anthers first, or it could pollinate itself.', 'bad'); return; }
        if (!loaded) { k.say('Collect pollen from the pollen parent first.', 'bad'); return; }
        done = true;
        B.stigma.firstChild.setAttribute('fill', '#8cc06a');
        k.say('Pollinated. Now we wait for the seeds to form and grow.', 'good');
        await K.wait(1200);
        result(p1, p2);
      });
    }

    function result(p1, p2) {
      area.innerHTML = '';
      k.tools.innerHTML = '';
      const isGoal = o => sc.attrs.every(a => o[a] === sc.goal[a]);
      let combos = [[]];
      sc.attrs.forEach(a => {
        const opts = [...new Set([p1[a], p2[a]])];
        const next = [];
        combos.forEach(c => opts.forEach(v => next.push([...c, v])));
        combos = next;
      });
      const all = combos.map(c => Object.fromEntries(sc.attrs.map((a, i) => [a, c[i]])));
      const winners = all.filter(isGoal);
      const pool = shuffle(all.filter(o => !isGoal(o)));
      const kids = winners.length ? [winners[0]] : [];
      let i = 0;
      while (kids.length < 3) kids.push(i < pool.length ? pool[i++] : all[Math.floor(Math.random() * all.length)]);
      const seedlings = shuffle(kids);
      const hasWinner = seedlings.some(isGoal);
      const goalLabel = 'Goal: ' + sc.attrs.map(a => TRAITS[a].label[sc.goal[a]]).join(' + ');
      k.chip(goalLabel);

      area.appendChild(el('p', 'phase', `<b>Weeks later.</b> The seeds from ${p1.name} and ${p2.name} have grown into three seedlings. They differ, because each inherited a different mix of its parents' traits. ` + (hasWinner ? 'Select the one you would keep, then clone it.' : '')));
      const grid = el('div', 'plants');
      grid.style.gridTemplateColumns = 'repeat(3,1fr)';
      let chosen = null;
      const go = hasWinner ? K.toolBtn(k, 'Keep and clone this plant', () => keep()) : null;
      if (go) go.disabled = true;
      const cards = seedlings.map((o, n) => {
        const b = el('button', 'plant');
        b.appendChild(plantSVG(o));
        b.appendChild(el('b', '', `Seedling ${n + 1}`));
        b.appendChild(el('div', 'tagrow', sc.attrs.map(a => `<span class="tag">${TRAITS[a].label[o[a]]}</span>`).join('')));
        b.onclick = () => {
          if (!hasWinner || b.disabled) return;
          chosen = o;
          cards.forEach(c => { c.b.classList.toggle('sel', c.o === o); c.b.dataset.role = c.o === o ? 'Keep' : ''; });
          go.disabled = false;
          k.say('');
        };
        grid.appendChild(b);
        return { b, o };
      });
      area.appendChild(grid);

      if (!hasWinner) {
        const lack = sc.attrs.filter(a => p1[a] !== sc.goal[a] && p2[a] !== sc.goal[a]).map(a => `"${TRAITS[a].label[sc.goal[a]]}"`).join(' and ');
        k.chip('No seedling meets the goal');
        k.say(`None of the seedlings has every trait you need. Neither ${p1.name} nor ${p2.name} carries ${lack}, so no offspring can inherit it. Go back and choose a different pair.`, 'bad');
        K.toolBtn(k, 'Choose different parents', () => { k.chip(goalLabel); choose(); });
        return;
      }

      async function keep() {
        if (!isGoal(chosen)) {
          const miss = sc.attrs.filter(a => chosen[a] !== sc.goal[a]).map(a => `"${TRAITS[a].label[chosen[a]]}"`).join(' and ');
          const card = cards.find(c => c.o === chosen);
          card.b.disabled = true; card.b.classList.remove('sel'); card.b.dataset.role = ''; card.b.style.opacity = .45;
          go.disabled = true; chosen = null;
          k.say(`That seedling is ${miss}, which is not what the grower asked for. Cloning it would only copy the wrong combination. Choose another.`, 'bad');
          return;
        }
        k.tools.innerHTML = '';
        k.say('');
        k.chip('Cloning the selected seedling');
        area.innerHTML = '';
        area.appendChild(el('p', 'phase', 'Seeds from a hybrid would shuffle the traits again. So growers <b>clone</b> the best plant, using cuttings or tissue culture, to get identical copies.'));
        const svg = s('svg', { viewBox: '0 0 600 210', style: 'max-width:640px;margin:0 auto' });
        area.appendChild(svg);
        const put = (x, cls) => { const outer = s('g', { transform: `translate(${x},4) scale(.9)` }, svg); const g = s('g', { class: cls || '' }, outer); drawPlant(g, chosen); return g; };
        put(20);
        s('text', { x: 74, y: 204, 'text-anchor': 'middle', class: 'sc-note' }, svg, 'Selected seedling');
        s('path', { d: 'M150 100 L210 100 M198 90 L210 100 L198 110', stroke: '#5c6b78', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, svg);
        for (let c = 0; c < 3; c++) { await K.wait(450); put(230 + c * 120, 'pop'); }
        s('text', { x: 410, y: 204, 'text-anchor': 'middle', class: 'sc-note' }, svg, 'Clones: genetically identical to the seedling');
        k.chip('Goal met');
        k.finish(sc.success + ' Cloning locks in the winning combination in every new plant.');
      }
    }

    choose();
  };
}

BioLab.register({
  id: 's2', num: 2, built: true,
  title: 'Artificial Pollination',
  short: 'Almost all vanilla in the world is pollinated by hand.',
  color: '#8a5a12',
  doneLine: 'You can now explain how breeders choose parents and cross them by hand to combine useful traits.',
  summary: {
    what: 'Pollen from a chosen parent is moved by hand or machine onto the stigma of another, so the cross is controlled and does not depend on natural pollinators.',
    adv: ['Precise control over which plants cross', 'Works without pollinators', 'Allows hybrid development'],
    dis: ['Labour-intensive and costly', 'Hard to scale to large areas', 'Timing-critical'],
    ex: ['Vanilla orchids', 'Date palms', 'Greenhouse tomatoes']
  },
  steps: [
    {
      type: 'hook',
      line: 'Almost all vanilla in the world was<br><em>pollinated by hand</em>.',
      sub: 'It is one of the most expensive spices there is. Why can\'t farmers just let nature do it?',
      image: 's2_hero', imageLabel: 'Hand-pollinating a vanilla orchid flower',
      button: 'Find out'
    },
    {
      type: 'learn', kicker: 'How it works',
      cards: [
        { title: 'Pollination moves pollen', text: 'Pollination is the transfer of pollen from the <b>anther</b> (male part) to the <b>stigma</b> (female part). Fertilisation can then occur, producing seeds and fruit.' },
        { title: 'Nature vs people', text: 'Normally wind, insects, birds and bats do the job. In <b>artificial pollination</b> a person or machine moves the pollen, using a brush, a stick or a spray. The seed parent\'s own anthers are usually removed so it cannot pollinate itself.' },
        { title: 'Why do it?', text: 'Breeders can choose <b>exactly which parents cross</b> to combine traits such as yield, flavour or disease resistance. It also works where pollinators are missing, such as inside greenhouses.' },
        { title: 'The vanilla problem', text: 'Vanilla\'s natural pollinators live only in <b>Mexico</b>, where it began. Everywhere else it is grown, each flower, open for only about a day, must be pollinated by hand.' }
      ]
    },
    { type: 'activity', title: 'Scenario 1', render: scenarioStep(SCENARIOS[0], 1) },
    { type: 'activity', title: 'Scenario 2', render: scenarioStep(SCENARIOS[1], 2) },
    { type: 'activity', title: 'Scenario 3', render: scenarioStep(SCENARIOS[2], 3) },
    {
      type: 'flip', kind: 'adv', kicker: 'Why growers do it', title: 'Advantages of artificial pollination',
      cards: [
        { title: 'Precise cross-breeding', text: 'Growers choose both parents, so desirable traits can be combined on purpose.' },
        { title: 'Works without pollinators', text: 'Crops can be grown where the natural pollinator is absent or in decline.' },
        { title: 'Suits controlled environments', text: 'Greenhouses and indoor farms have few or no insects.' },
        { title: 'Enables hybrid development', text: 'Hybrid seed with high yield or disease resistance can be produced reliably.' }
      ]
    },
    {
      type: 'flip', kind: 'dis', kicker: 'The catch', title: 'Disadvantages of artificial pollination',
      cards: [
        { title: 'Labour-intensive', text: 'Flowers are often pollinated one at a time, which makes the product expensive.' },
        { title: 'Hard to scale', text: 'It does not suit very large areas such as broadacre crops.' },
        { title: 'Timing is critical', text: 'Flowers are only receptive for a short window, sometimes just hours.' },
        { title: 'Human error', text: 'Poor technique or bad timing lowers fertilisation rates.' }
      ]
    },
    {
      type: 'examples', kicker: 'Real world', title: 'Where it is used',
      items: [
        { image: 's2_ex_vanilla', imageLabel: 'Vanilla flower being pollinated with a small stick', title: 'Vanilla', text: 'Grown mainly in Madagascar and Indonesia. Every flower is pollinated by hand.' },
        { image: 's2_ex_dates', imageLabel: 'Date palm flowers being pollinated by a worker', title: 'Date palms', text: 'Male and female flowers are on separate trees, so growers apply male pollen to female flowers. This has been done for thousands of years.' },
        { image: 's2_ex_tomato', imageLabel: 'Greenhouse tomatoes with a vibrating pollination wand', title: 'Greenhouse tomatoes', text: 'Vibrating wands, or bumblebees, replace the wind and insects that are missing indoors.' }
      ]
    },
    {
      type: 'quiz',
      questions: [
        { q: 'Why must vanilla be pollinated by hand outside Mexico?', options: ['Its natural pollinators do not live there', 'It has no anthers', 'It cannot produce pollen', 'Wind pollination damages the flowers'], answer: 0, explain: 'The pollinators that visit vanilla in Mexico are not found in the places it is now farmed.' },
        { q: 'Which of these is NOT an advantage of artificial pollination?', options: ['It allows precise cross-breeding', 'It works without natural pollinators', 'It removes the need for skill and labour', 'It helps produce hybrids'], answer: 2, explain: 'Artificial pollination is skilled, labour-intensive work. That is one of its main disadvantages.' },
        { q: 'True or false: artificial pollination is easily scaled up to very large crop areas.', options: ['True', 'False'], answer: 1, shuffle: false, explain: 'False. Hand pollination is slow and costly, so it suits high-value crops and small areas.' }
      ]
    }
  ]
});
})();
