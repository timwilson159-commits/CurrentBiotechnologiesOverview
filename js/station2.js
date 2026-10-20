(function () {
const { el } = BioLab;
const { s } = SVGKit;

function flowerSVG(onAnther, onStigma, onPetal) {
  const svg = s('svg', { viewBox: '0 0 140 175' });
  s('path', { d: 'M70 175 L70 104', stroke: '#5c8a4a', 'stroke-width': 5, fill: 'none' }, svg);
  s('path', { d: 'M70 150 Q40 142 34 122 Q58 124 70 142', fill: '#7aa862', stroke: '#5c8a4a' }, svg);
  const pod = s('ellipse', { cx: 70, cy: 112, rx: 0, ry: 0, fill: '#5c8a4a', stroke: '#3f6a31', 'stroke-width': 1.5 }, svg);
  for (let i = 0; i < 6; i++) {
    const p = s('ellipse', { cx: 70, cy: 38, rx: 13, ry: 30, fill: '#efe7a6', stroke: '#b9ad5b', 'stroke-width': 1.5, transform: `rotate(${i * 60} 70 70)` }, svg);
    p.addEventListener('click', onPetal);
  }
  s('circle', { cx: 70, cy: 70, r: 15, fill: '#e2d887', stroke: '#b9ad5b' }, svg);
  const anther = s('g', { class: 'hot' }, svg);
  s('circle', { cx: 70, cy: 56, r: 13, fill: '#f2b52c', stroke: '#a8740b', 'stroke-width': 2, class: 'hl' }, anther);
  const dots = [[65, 52], [74, 53], [70, 60], [63, 60], [76, 61]].map(([x, y]) => s('circle', { cx: x, cy: y, r: 2, fill: '#fff3c0' }, anther));
  s('circle', { cx: 70, cy: 56, r: 22, fill: 'transparent' }, anther);
  const stigma = s('g', { class: 'hot' }, svg);
  s('circle', { cx: 70, cy: 86, r: 10, fill: '#cfe3b8', stroke: '#6f9a55', 'stroke-width': 2, class: 'hl' }, stigma);
  s('circle', { cx: 70, cy: 86, r: 20, fill: 'transparent' }, stigma);
  s('text', { x: 92, y: 52, class: 'sc-note' }, svg, 'anther');
  s('text', { x: 84, y: 100, class: 'sc-note' }, svg, 'stigma');
  anther.addEventListener('click', () => onAnther(dots));
  stigma.addEventListener('click', () => onStigma(stigma, pod));
  return svg;
}

function pollinationGame(box, next) {
  const k = SimKit.shell(box, {
    kicker: 'Activity',
    title: 'Pollinate by hand',
    brief: 'The anther makes pollen. The stigma receives it. Tap an anther to pick up pollen on your stick, then tap a stigma to pollinate that flower. Pollinate all six.'
  }, next);
  const N = 6;
  let done = 0, loaded = false;
  const grid = el('div', 'flowers');
  const bar = el('div', 'stick');
  const state = el('b', '', 'Stick: empty');
  const meter = el('div', 'meter', '<i></i>');
  const count = el('span', '', `0 of ${N} pollinated`);
  bar.append(state, meter, count);
  k.stage.append(bar, grid);

  function setLoaded(v) {
    loaded = v;
    state.textContent = v ? 'Stick: loaded with pollen' : 'Stick: empty';
    state.style.color = v ? 'var(--good)' : '';
  }
  for (let i = 0; i < N; i++) {
    const cell = el('div', 'fl');
    let pollinated = false;
    const svg = flowerSVG(
      dots => {
        if (pollinated) return;
        if (loaded) { k.say('Your stick already has pollen. Find a stigma.', 'bad'); return; }
        setLoaded(true);
        dots.forEach(d => d.setAttribute('opacity', .15));
        k.say('Pollen collected. Now tap a stigma.');
      },
      (stigma, pod) => {
        if (pollinated) return;
        if (!loaded) { k.say('Nothing to deliver. Pick up pollen from an anther first.', 'bad'); return; }
        pollinated = true;
        setLoaded(false);
        stigma.firstChild.setAttribute('fill', '#8cc06a');
        pod.setAttribute('rx', 5); pod.setAttribute('ry', 15);
        pod.classList.add('pop');
        done++;
        count.textContent = `${done} of ${N} pollinated`;
        meter.firstChild.style.width = done / N * 100 + '%';
        k.say('Pollinated. The flower can now be fertilised and form a pod.', 'good');
        if (done === N) k.finish('All six flowers pollinated. Real growers repeat this for thousands of flowers, and each one is only open for about a day.');
      },
      () => k.say('Those are petals. Look for the anther and the stigma.', 'bad')
    );
    cell.appendChild(svg);
    grid.appendChild(cell);
  }
}

BioLab.register({
  id: 's2', num: 2, built: true,
  title: 'Artificial Pollination',
  short: 'Almost all vanilla in the world is pollinated by hand.',
  color: '#8a5a12',
  doneLine: 'You can now explain why some of the world\'s most valuable crops depend on human hands.',
  summary: {
    what: 'Pollen is moved by hand or machine from the anther to the stigma, so fertilisation does not depend on natural pollinators.',
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
        { title: 'Nature vs people', text: 'Normally wind, insects, birds and bats do the job. In <b>artificial pollination</b> a person or machine moves the pollen, using a brush, a stick or a spray.' },
        { title: 'Why do it?', text: 'Breeders can choose <b>exactly which parents cross</b> to combine traits such as yield, flavour or disease resistance. It also works where pollinators are missing, such as inside greenhouses.' },
        { title: 'The vanilla problem', text: 'Vanilla\'s natural pollinators live only in <b>Mexico</b>, where it began. Everywhere else it is grown, each flower, open for only about a day, must be pollinated by hand.' }
      ]
    },
    { type: 'activity', title: 'Pollinate', render: (box, next) => pollinationGame(box, next) },
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
