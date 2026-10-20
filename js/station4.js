(function () {
const { el } = BioLab;
const { s, pt } = SVGKit;
const K = SimKit;
const G = GeneScene;

function geneLab(box, next) {
  const k = K.shell(box, {
    kicker: 'Activity',
    title: 'Build a recombinant plasmid',
    brief: 'You will move the human insulin gene into a bacterium in three moves: cut the gene out, paste it into a plasmid, then put the plasmid into the bacterium.'
  }, next);
  const svg = s('svg', {}, k.stage);
  const sc = G.draw(svg);
  const gb = G.geneBox;
  const zone = (window.DROPZONES && DROPZONES.geneToPlasmid) || G.defaultZone;
  let phase = 'cut', cutsDone = 0, tr = { x: 0, y: 0 };
  k.chip('Move 1 of 3: cut the gene out');
  k.say('Click both "Cut here" markers. The restriction enzyme cuts DNA at a specific sequence.');

  const setTr = () => sc.gene.setAttribute('transform', `translate(${tr.x},${tr.y})`);
  sc.gene.style.pointerEvents = 'none';

  sc.cuts.forEach(c => c.addEventListener('click', async () => {
    if (c.dataset.d) return;
    c.dataset.d = 1;
    c.querySelector('line').setAttribute('stroke-dasharray', '0');
    c.querySelector('rect').setAttribute('fill', '#f4d4d0');
    c.style.cursor = 'default';
    cutsDone++;
    if (cutsDone < 2) { k.say('One cut made. Now the other end.', 'good'); return; }
    sc.cutNote.textContent = 'restriction enzyme';
    await K.wait(300);
    sc.cuts.forEach(x => x.style.display = 'none');
    sc.cutNote.style.display = 'none';
    await K.anim(700, e => { tr.y = G.freeOffset.y * e; setTr(); });
    phase = 'paste';
    sc.gene.style.pointerEvents = '';
    k.chip('Move 2 of 3: paste it into the plasmid');
    k.say('The gene is free. The same enzyme cut open the plasmid. Drag the gene into the gap in the plasmid.', 'good');
  }));

  let dragging = false, last = null;
  sc.gene.addEventListener('pointerdown', ev => {
    if (phase !== 'paste') return;
    ev.preventDefault();
    try { sc.gene.setPointerCapture(ev.pointerId); } catch (_) {}
    dragging = true;
    last = pt(svg, ev);
  });
  sc.gene.addEventListener('pointermove', ev => {
    if (!dragging) return;
    const p = pt(svg, ev);
    tr.x += p.x - last.x; tr.y += p.y - last.y;
    last = p;
    setTr();
  });
  sc.gene.addEventListener('pointerup', async () => {
    if (!dragging) return;
    dragging = false;
    const cx = gb.x + gb.w / 2 + tr.x, cy = gb.y + gb.h / 2 + tr.y;
    const inside = cx >= zone.x && cx <= zone.x + zone.w && cy >= zone.y && cy <= zone.y + zone.h;
    if (!inside) {
      k.say('Not quite. The gene needs to go into the gap in the plasmid.', 'bad');
      return;
    }
    phase = 'ligase';
    sc.gene.style.display = 'none';
    const P = G.plasmid;
    s('path', { d: G.arc(P.r, -90 - P.halfGap, -90 + P.halfGap, 0), fill: 'none', stroke: '#2f6f55', 'stroke-width': 12, class: 'pop' }, sc.plasmid);
    const lg = s('text', { x: P.cx, y: P.cy - P.r - 22, 'text-anchor': 'middle', class: 'sc-note lt pop lig' }, svg, 'DNA ligase seals the joins');
    sc.plasmid.querySelector('text').textContent = 'recombinant plasmid';
    k.chip('Move 3 of 3: put it into the bacterium');
    k.say('The gene is in the plasmid. The plasmid is now recombinant DNA.', 'good');
    b.hidden = false;
  });

  const b = K.toolBtn(k, 'Insert plasmid into the bacterium', async () => {
    b.disabled = true;
    const P = G.plasmid;
    svg.appendChild(sc.plasmid);
    svg.querySelectorAll('.lig').forEach(n => n.remove());
    await K.anim(1300, e => {
      const x = P.cx + (605 - P.cx) * e, y = P.cy + (322 - P.cy) * e, sc2 = 1 - .55 * e;
      sc.plasmid.setAttribute('transform', `translate(${x},${y}) scale(${sc2})`);
    });
    k.say('The bacterium has taken up the plasmid and reads the new gene.', 'good');
    await K.wait(700);
    const spots = [[510, 275], [545, 365], [600, 268], [660, 372], [705, 290], [700, 350], [520, 330], [650, 275]];
    for (const [x, y] of spots) {
      s('circle', { cx: x, cy: y, r: 7, fill: '#2f6f55', stroke: '#1d4d3a', 'stroke-width': 1.5, class: 'pop' }, svg);
      await K.wait(180);
    }
    s('text', { x: 605, y: 245, 'text-anchor': 'middle', class: 'sc-big pop' }, svg, 'Human insulin');
    k.chip('Bacterium is making insulin');
    k.finish('The bacterium now makes human insulin. As it divides, every new cell carries the gene, so huge numbers of cells make the protein.');
  });
  b.hidden = true;
}

BioLab.register({
  id: 's4', num: 4, built: true,
  title: 'Transgenic Species',
  short: 'Move a gene between species and watch it work.',
  color: '#2f6f55',
  doneLine: 'You have built a recombinant plasmid and seen why transgenic organisms matter.',
  summary: {
    what: 'A gene from one species is cut out with restriction enzymes, joined into a vector such as a plasmid with ligase, and inserted into another species, which then makes the new protein.',
    adv: ['Makes valuable proteins at scale (e.g. insulin)', 'Pest- and disease-resistant crops', 'Improved nutrition', 'Medical research models'],
    dis: ['Unknown long-term ecological effects', 'Gene flow to wild relatives', 'Ethical concerns', 'Public opposition and strict regulation'],
    ex: ['Insulin-producing bacteria', 'GloFish', 'Golden Rice', 'Bt cotton']
  },
  steps: [
    {
      type: 'hook',
      line: 'A gene from a jellyfish went into a fish. The fish <em>glows</em>.',
      sub: 'Fluorescent pet fish are sold in some countries, but the same technology also makes medicines and crops. Here is how it works.',
      image: 's4_hero', imageLabel: 'GloFish fluorescent zebrafish in an aquarium',
      button: 'Find out'
    },
    {
      type: 'learn', kicker: 'How it works',
      cards: [
        { title: 'DNA from another species', text: 'A <b>transgenic</b> organism carries a gene from a different species, called a <b>transgene</b>, in its genome.' },
        { title: 'Cut, paste, deliver', text: '<b>Restriction enzymes</b> cut the gene out. <b>DNA ligase</b> joins it into a <b>vector</b>, often a plasmid. The vector carries the gene into the host cell.' },
        { title: 'The host reads it', text: 'The genetic code is <b>universal</b>, so the host transcribes and translates the new gene like its own and makes the new protein.' },
        { title: 'First big success: insulin', text: 'In 1982 the first medicine made this way, human insulin from bacteria, was approved. Most insulin used today is made by <b>recombinant</b> microbes.' }
      ]
    },
    { type: 'activity', title: 'Gene lab', render: (box, next) => geneLab(box, next) },
    {
      type: 'examples', kicker: 'Case studies', title: 'Transgenic organisms in use',
      items: [
        { image: 's4_ex_glofish', imageLabel: 'GloFish fluorescent zebrafish', title: 'GloFish', text: 'Zebrafish given fluorescent protein genes from jellyfish and coral. The original aim was fish that glow in polluted water to detect pollutants.' },
        { image: 's4_ex_goldenrice', imageLabel: 'Golden Rice grains beside ordinary white rice', title: 'Golden Rice', text: 'Rice with genes from maize and a soil bacterium so the grain makes beta-carotene, which the body turns into vitamin A. Aimed at vitamin A deficiency.' },
        { image: 's4_ex_btcotton', imageLabel: 'Cotton plants in a field', title: 'Bt cotton', text: 'Cotton with a gene from the bacterium Bacillus thuringiensis. The plant makes a protein toxic to bollworm caterpillars, so less insecticide is sprayed.' }
      ]
    },
    {
      type: 'flip', kind: 'adv', kicker: 'Why do it', title: 'Advantages of transgenic technology',
      cards: [
        { title: 'Valuable proteins at scale', text: 'Microbes can make medicines such as insulin in huge quantities.' },
        { title: 'Pest and disease resistance', text: 'Crops can protect themselves, so fewer chemicals are needed.' },
        { title: 'Improved nutrition', text: 'Foods can be given nutrients they would not normally contain.' },
        { title: 'Research models', text: 'Animals with added genes help scientists study diseases and gene function.' }
      ]
    },
    {
      type: 'flip', kind: 'dis', kicker: 'The catch', title: 'Disadvantages of transgenic technology',
      cards: [
        { title: 'Unknown ecological effects', text: 'Long-term impacts on other species and ecosystems are hard to predict.' },
        { title: 'Gene flow', text: 'Transgenes could spread to wild relatives through cross-pollination or breeding.' },
        { title: 'Ethical concerns', text: 'Some people object to moving genes between species.' },
        { title: 'Public opposition and regulation', text: 'Strict testing and approval make development slow and expensive.' }
      ]
    },
    {
      type: 'quiz',
      questions: [
        { q: 'Which enzymes cut a gene out of DNA?', options: ['Restriction enzymes', 'DNA ligase', 'DNA polymerase', 'Helicase'], answer: 0, explain: 'Restriction enzymes cut DNA at specific sequences. DNA ligase later joins pieces together.' },
        { q: 'What was the first practical medicine made using transgenic bacteria?', options: ['Insulin', 'Penicillin', 'Vitamin A', 'Growth hormone from sheep'], answer: 0, explain: 'Human insulin made by bacteria was approved in 1982 and transformed diabetes treatment.' },
        { q: 'What does "Bt" in Bt cotton stand for?', options: ['Bacillus thuringiensis', 'Bacterial toxin', 'Biotech trial', 'Beta-tolerant'], answer: 0, explain: 'Bt cotton carries a gene from the soil bacterium Bacillus thuringiensis.' }
      ]
    }
  ]
});
})();
