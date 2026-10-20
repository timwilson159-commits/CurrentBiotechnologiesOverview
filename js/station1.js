(function () {
const { el, shuffle } = BioLab;

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
      cards: [
        { title: 'No mating required', text: 'Artificial insemination (AI) means <b>collecting sperm</b> from a chosen male and <b>placing it in the female reproductive tract by hand</b>, using instruments.' },
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
