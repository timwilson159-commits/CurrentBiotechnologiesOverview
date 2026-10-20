(function () {
'use strict';

const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
const shuffle = a => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---------- saved progress ---------- */
const KEY = 'biotechlab_v1';
const DEV = new URLSearchParams(location.search).has('dev');
let saved = { done: {} };
try { saved = Object.assign({ done: {} }, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} };

const stations = [];
const app = () => document.getElementById('app');
const isDone = st => !!saved.done[st.id];
const isUnlocked = st => DEV || st.num === 1 || isDone(stations[st.num - 2]);

/* ---------- figures: images/<id>.jpg|png if present, else a labelled placeholder ---------- */
let curStation = null, figCount = 0;
function imgSlot(id, label, cls, mode) {
  const fig = el('figure', 'fig');
  const d = el('div', 'imgslot ' + (cls || ''));
  d.appendChild(el('div', 'ph', `<b>Image placeholder</b><small>images/${id}.jpg</small>`));
  const im = new Image();
  im.alt = label;
  let triedPng = false;
  im.onload = () => { d.innerHTML = ''; d.appendChild(im); d.classList.add('has'); };
  im.onerror = () => { if (!triedPng) { triedPng = true; im.src = `images/${id}.png`; } };
  im.src = `images/${id}.jpg`;
  fig.appendChild(d);
  if (mode === 'thumb') return fig;
  if (mode === 'plain') { fig.appendChild(el('figcaption', '', label)); return fig; }
  figCount++;
  fig.appendChild(el('figcaption', '', `<b>Figure ${curStation ? curStation.num : 0}.${figCount}</b> ${label}`));
  return fig;
}

/* ---------- step renderers ---------- */
const Steps = {};

Steps.hook = (box, s, st, next) => {
  const w = el('div', 'hook');
  w.appendChild(el('div', 'chap', `<span class="num">${st.num}</span><span class="nm"><small>Station ${st.num}</small>${st.title}</span>`));
  w.appendChild(el('h1', 'hook-line', s.line));
  if (s.sub) w.appendChild(el('p', 'sub', s.sub));
  if (s.image) w.appendChild(imgSlot(s.image, s.imageLabel || 'Station image'));
  const b = el('button', 'btn', s.button || 'Begin');
  b.onclick = next;
  w.appendChild(el('div', 'actions')).appendChild(b);
  box.appendChild(w);
};

Steps.learn = (box, s, st, next) => {
  let i = 0, dir = 'fwd';
  const host = el('div');
  box.appendChild(host);
  function draw() {
    const c = s.cards[i];
    host.innerHTML = '';
    host.appendChild(el('div', 'kicker', s.kicker || 'Key ideas'));
    host.appendChild(el('div', 'lcard' + (dir === 'back' ? ' back' : ''),
      `<div class="lab">Key idea ${(s.offset || 0) + i + 1} of ${s.total || s.cards.length}</div><h2>${c.title}</h2><p>${c.text}</p>`));
    const acts = el('div', 'actions');
    if (i > 0) {
      const back = el('button', 'btn ghost', 'Previous');
      back.onclick = () => { i--; dir = 'back'; draw(); };
      acts.appendChild(back);
    }
    const nx = el('button', 'btn', i < s.cards.length - 1 ? 'Next' : 'Continue');
    nx.onclick = () => { if (i < s.cards.length - 1) { i++; dir = 'fwd'; draw(); } else next(); };
    acts.appendChild(nx);
    host.appendChild(acts);
  }
  draw();
};

Steps.guess = (box, s, st, next) => {
  const w = el('div', 'guess');
  w.appendChild(el('div', 'kicker', s.kicker || 'Predict'));
  w.appendChild(el('h2', 'sec-h', s.question));
  if (s.lead) w.appendChild(el('p', 'lead', s.lead));
  const row = el('div', 'gopts');
  const acts = el('div', 'actions');
  const go = el('button', 'btn', 'Continue');
  go.onclick = next;
  acts.appendChild(go);
  const btns = s.options.map(o => {
    const b = el('button', 'gopt', o.label);
    b.onclick = () => {
      btns.forEach((x, k) => { x.disabled = true; if (s.options[k].correct) x.classList.add('right'); });
      if (!o.correct) b.classList.add('wrong');
      w.appendChild(el('div', 'reveal', (o.correct ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + s.reveal));
      w.appendChild(acts);
    };
    row.appendChild(b);
    return b;
  });
  w.appendChild(row);
  box.appendChild(w);
};

Steps.flip = (box, s, st, next) => {
  const w = el('div', 'flip-wrap ' + s.kind);
  w.appendChild(el('div', 'kicker', s.kicker));
  w.appendChild(el('h2', 'sec-h', s.title));
  w.appendChild(el('p', 'lead', s.lead || 'Select each card to reveal it.'));
  const grid = el('div', 'flips');
  let seen = 0;
  const counter = el('div', 'counter', `0 of ${s.cards.length} revealed`);
  const go = el('button', 'btn', 'Continue');
  go.disabled = true;
  go.onclick = next;
  s.cards.forEach((c, i) => {
    const label = s.kind === 'adv' ? 'Advantage' : 'Disadvantage';
    const f = el('button', 'flip',
      `<div class="flip-in">
         <div class="face front"><b>${label} ${i + 1}</b><small>Select to reveal</small></div>
         <div class="face back"><b>${c.title}</b><span>${c.text}</span></div>
       </div>`);
    f.style.animationDelay = i * 0.06 + 's';
    f.onclick = () => {
      if (f.classList.contains('on')) return;
      f.classList.add('on');
      seen++;
      counter.textContent = seen === s.cards.length ? 'All revealed' : `${seen} of ${s.cards.length} revealed`;
      if (seen === s.cards.length) go.disabled = false;
    };
    grid.appendChild(f);
  });
  w.append(grid, counter, el('div', 'actions'));
  w.lastChild.appendChild(go);
  box.appendChild(w);
};

Steps.examples = (box, s, st, next) => {
  const w = el('div', 'ex-wrap');
  w.appendChild(el('div', 'kicker', s.kicker || 'Real world'));
  w.appendChild(el('h2', 'sec-h', s.title || 'In the real world'));
  const grid = el('div', 'exs');
  s.items.forEach((it, i) => {
    const c = el('div', 'ex');
    c.style.animationDelay = i * 0.08 + 's';
    c.appendChild(imgSlot(it.image, it.imageLabel || it.title, 'sq'));
    c.appendChild(el('h3', '', it.title));
    c.appendChild(el('p', '', it.text));
    grid.appendChild(c);
  });
  w.appendChild(grid);
  const b = el('button', 'btn', 'On to the quiz');
  b.onclick = next;
  w.appendChild(el('div', 'actions')).appendChild(b);
  box.appendChild(w);
};

Steps.activity = (box, s, st, next) => {
  s.render(box, next, { el, shuffle, imgSlot });
};

Steps.quiz = (box, s, st, next) => {
  const total = s.questions.length;
  function run() {
    const qs = s.questions.map(q => {
      const idx = q.options.map((_, i) => i);
      return { q, order: q.shuffle === false ? idx : shuffle(idx) };
    });
    const marks = qs.map(() => '');
    let k = 0, score = 0;

    function showQ() {
      box.innerHTML = '';
      const { q, order } = qs[k];
      const w = el('div');
      w.appendChild(el('div', 'kicker', `Check your understanding · question ${k + 1} of ${total}`));
      const dots = el('div', 'qdots');
      marks.forEach((m, i) => dots.appendChild(el('span', 'qd ' + (m || (i === k ? 'cur' : '')))));
      w.appendChild(dots);
      w.appendChild(el('h2', 'q', q.q));
      const opts = el('div', 'opts');
      const acts = el('div', 'actions');
      const nx = el('button', 'btn', k < total - 1 ? 'Next question' : 'See result');
      let answered = false;
      const btns = order.map((oi, n) => {
        const b = el('button', 'opt', `<span class="letter">${'ABCD'[n]}</span><span>${q.options[oi]}</span>`);
        b.onclick = () => {
          if (answered) return;
          answered = true;
          const right = oi === q.answer;
          if (right) score++;
          marks[k] = right ? 'ok' : 'no';
          btns.forEach(x => x.disabled = true);
          btns[order.indexOf(q.answer)].classList.add('right');
          if (!right) b.classList.add('wrong');
          w.appendChild(el('div', 'explain', (right ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + q.explain));
          acts.appendChild(nx);
          w.appendChild(acts);
        };
        opts.appendChild(b);
        return b;
      });
      nx.onclick = () => { if (k < total - 1) { k++; showQ(); } else showResult(); };
      w.appendChild(opts);
      box.appendChild(w);
    }

    function showResult() {
      box.innerHTML = '';
      const pass = score === total;
      const w = el('div', 'result ' + (pass ? 'pass' : 'fail'));
      w.innerHTML = `<div class="kicker">Quiz result</div><div class="score">${score} / ${total}</div>` + (pass
        ? `<h2>All correct</h2><p>Well done. The next station is now unlocked.</p>`
        : `<h2>Not quite there yet</h2><p>You need ${total} out of ${total} to move on. Have another go. The answer options will be reshuffled.</p>`);
      const b = el('button', 'btn', pass ? 'Finish station' : 'Try again');
      b.onclick = pass ? next : run;
      w.appendChild(el('div', 'actions')).appendChild(b);
      box.appendChild(w);
    }
    showQ();
  }
  run();
};

/* ---------- screens ---------- */
function showHome() {
  curStation = null;
  document.body.removeAttribute('data-station');
  document.body.style.removeProperty('--accent');
  const root = app();
  root.innerHTML = '';
  const home = el('div', 'home');
  home.appendChild(el('div', 'home-head',
    `<div class="eyebrow">HSC Biology · Biotechnology</div><h1>Reproductive Technologies in Agriculture</h1><p>Work through the four stations in order. Each one explains a technology, asks you to do something with it, and ends with a short quiz. Finish all four to unlock your summary table.</p>`));
  const toc = el('div', 'toc');
  stations.forEach(st => {
    const open = st.built && isUnlocked(st);
    const state = isDone(st) ? 'done' : open ? 'open' : st.built ? 'locked' : 'soon';
    const badge = { done: 'Complete', open: 'Start', locked: 'Locked', soon: 'Coming soon' }[state];
    const r = el('button', 'row ' + state,
      `<span class="n">${st.num}</span><h3>${st.title}</h3><p>${st.short}</p><span class="badge">${badge}</span>`);
    r.style.setProperty('--accent', st.color);
    if (open) r.onclick = () => runStation(st);
    else r.disabled = true;
    toc.appendChild(r);
  });
  const some = stations.some(isDone) || DEV;
  const all = stations.length && stations.every(isDone);
  const sum = el('button', 'row summary ' + (some ? 'open' : 'locked'),
    `<span class="n">+</span><h3>Summary table</h3><p>The table for your notebook. It fills in as you complete each station.</p><span class="badge">${all ? 'Complete' : some ? 'Open' : 'Locked'}</span>`);
  if (some) sum.onclick = showSummary; else sum.disabled = true;
  toc.appendChild(sum);
  home.appendChild(toc);
  const foot = el('div', 'home-foot');
  const reset = el('button', '', 'Reset my progress');
  reset.onclick = () => { if (confirm('Clear all progress on this device?')) { saved = { done: {} }; persist(); showHome(); } };
  foot.appendChild(reset);
  if (DEV) foot.appendChild(el('div', '', 'Dev mode: all stations unlocked'));
  home.appendChild(foot);
  root.appendChild(home);
  window.scrollTo(0, 0);
}

const list = a => '<ul>' + a.map(t => `<li>${t}</li>`).join('') + '</ul>';

function showSummary() {
  curStation = null;
  document.body.removeAttribute('data-station');
  document.body.style.removeProperty('--accent');
  const root = app();
  root.innerHTML = '';
  const top = el('header', 'topwrap');
  const back = el('button', 'btn ghost sm', '← Contents');
  back.onclick = showHome;
  const t = el('div', 'topbar');
  t.append(back, el('div', 'topbar-title', 'Summary table'));
  top.appendChild(t);
  const wrap = el('div', 'sum-wrap');
  wrap.appendChild(el('div', 'kicker', 'For your notebook'));
  wrap.appendChild(el('h1', '', '5.1.3 Plant and Animal Manipulation in Agriculture'));
  wrap.appendChild(el('p', 'lead', 'Copy this table into your notebook. Each row fills in when you complete its station.'));
  let rows = '';
  stations.forEach((st, i) => {
    const d = (isDone(st) || DEV) && st.summary;
    rows += `<tr class="in" style="animation-delay:${i * 0.15}s"><th scope="row">${st.title}</th>` + (d
      ? `<td data-l="What is it / How does it work?">${d.what}</td><td data-l="Advantages">${list(d.adv)}</td><td data-l="Disadvantages">${list(d.dis)}</td><td data-l="Example(s)">${list(d.ex)}</td>`
      : `<td class="empty" colspan="4">Complete Station ${st.num} to fill in this row.</td>`) + '</tr>';
  });
  wrap.appendChild(el('div', '', `<table class="sum"><thead><tr><th></th><th>What is it / How does it work?</th><th>Advantages</th><th>Disadvantages</th><th>Example(s)</th></tr></thead><tbody>${rows}</tbody></table>`));
  const acts = el('div', 'actions');
  const copy = el('button', 'btn', 'Copy table');
  copy.onclick = async () => {
    const lines = [['', 'What is it / How does it work?', 'Advantages', 'Disadvantages', 'Example(s)'].join('\t')];
    stations.forEach(st => {
      if (!(isDone(st) || DEV) || !st.summary) return;
      const d = st.summary;
      lines.push([st.title, d.what, d.adv.join('; '), d.dis.join('; '), d.ex.join('; ')].join('\t'));
    });
    const text = lines.join('\n');
    try { await navigator.clipboard.writeText(text); }
    catch (e) { const ta = el('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    copy.textContent = 'Copied';
    setTimeout(() => copy.textContent = 'Copy table', 1600);
  };
  const print = el('button', 'btn ghost', 'Print');
  print.onclick = () => window.print();
  const home = el('button', 'btn ghost', 'Back to contents');
  home.onclick = showHome;
  acts.append(copy, print, home);
  wrap.appendChild(acts);
  root.append(top, wrap);
  window.scrollTo(0, 0);
}

function runStation(st) {
  curStation = st;
  figCount = 0;
  document.body.dataset.station = st.id;
  document.body.style.setProperty('--accent', st.color);
  const root = app();
  root.innerHTML = '';
  const wrap = el('header', 'topwrap');
  const top = el('div', 'topbar');
  const back = el('button', 'btn ghost sm', '← Contents');
  back.onclick = showHome;
  const stepTxt = el('div', 'topbar-step');
  top.append(back, el('div', 'topbar-title', `${st.num}. ${st.title}`), stepTxt);
  const bar = el('div', 'pbar');
  const fill = bar.appendChild(el('i'));
  wrap.append(top, bar);
  const stage = el('main', 'stage');
  root.append(wrap, stage);

  function go(n) {
    figCount = 0;
    stepTxt.textContent = `Step ${n + 1} of ${st.steps.length}`;
    fill.style.width = (n / st.steps.length * 100) + '%';
    stage.innerHTML = '';
    const box = el('div', 'step step-' + st.steps[n].type);
    stage.appendChild(box);
    window.scrollTo(0, 0);
    Steps[st.steps[n].type](box, st.steps[n], st, () => n < st.steps.length - 1 ? go(n + 1) : finish());
  }

  function finish() {
    saved.done[st.id] = true;
    persist();
    fill.style.width = '100%';
    stepTxt.textContent = 'Complete';
    stage.innerHTML = '';
    const nxt = stations[st.num];
    const w = el('div', 'step complete',
      `<div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2>Station ${st.num} complete</h2><p>${st.doneLine || 'Well done.'}</p>` +
      (nxt ? `<p class="unlock">Next: Station ${nxt.num}, ${nxt.title}</p>` : `<p class="unlock">All stations complete. Your summary table is unlocked.</p>`));
    const acts = el('div', 'actions');
    const home = el('button', 'btn ghost', 'Back to contents');
    home.onclick = showHome;
    acts.appendChild(home);
    if (nxt && nxt.built) {
      const go2 = el('button', 'btn', `Start Station ${nxt.num}`);
      go2.onclick = () => runStation(nxt);
      acts.appendChild(go2);
    } else if (!nxt || stations.every(isDone)) {
      const sm = el('button', 'btn', 'View your summary table');
      sm.onclick = showSummary;
      acts.appendChild(sm);
    }
    w.appendChild(acts);
    stage.appendChild(w);
  }
  go(0);
}

window.BioLab = {
  el, shuffle, imgSlot,
  register(st) { stations[st.num - 1] = st; },
  start() { showHome(); }
};
})();
