const KITS = [
  { id:'maroon',  code:'P 214', name:'Imperial Maroon',  h:['Wear your','heritage'],   body:'Club maroon, gold foil and a crest. The shirt that still feels like the trophy in your childhood.', cap:'Heritage cloth, gold foil, made to remember', tags:['Foil 7','Academy crest','Heritage cloth'], number:'7',  image:'kits/maroon.webp',   glow:'#8a1122' },
  { id:'emerald', code:'P 291', name:'Emerald Sovereign', h:['Hold the','standard'],    body:'Deep pine knit with antique gold piping. An away standard for clubs that keep the crest as a promise.', cap:'Pine knit, antique gold piping', tags:['Foil 19','Pine knit','Away standard'], number:'19', image:'kits/emerald.webp', glow:'#0a553a' },
  { id:'obsidian',code:'P 360', name:'Obsidian Blackout', h:['Built for','the legacy'], body:'Matte black knit with gold numbering and trim. Our most requested look for finals, launches and limited drops.', cap:'Made for the nights that matter most', tags:['Foil 88','Limited','Night kit'], number:'88', edition:'Legacy', sub:'Limited edition', image:'kits/obsidian.webp', glow:'#6a5a35' },
  { id:'royal',   code:'P 412', name:'Royal Navy',        h:['Own the','night sky'],    body:'Deep royal knit with gold crest and trim. Calm under floodlights, loud on the scoreboard.', cap:'Royal knit, gold crest, built for cup nights', tags:['Foil 10','Royal knit','Cup kit'], number:'10', image:'kits/royal.webp', glow:'#1b3a9a' },
  { id:'sunset',  code:'P 118', name:'Sunset Orange',     h:['Light up the','touchline'], body:'Burnt orange with gold trim. The kit you spot from the far side of the pitch, in any weather.', cap:'Burnt orange, gold trim, impossible to miss', tags:['Foil 9','Derby kit','Match day'], number:'9', image:'kits/sunset.webp', glow:'#b4501a' }
];
const WORKS = [
  ['Academy training kit','Heritage weave · cut in the atelier','Atelier','kits/wild-academy.jpg'],
  ['Away, number five','Matchday white · travelling side','Away','kits/wild-five.jpg'],
  ['Floodlight orange','Derby kit · seen from the stands','Match','kits/wild-orange.jpg'],
  ['Night seven','Obsidian · gold foil under one lamp','Night','kits/wild-seven.jpg'],
  ['Cream standard','Women’s match · quiet crest','Club','kits/wild-cream.jpg']
];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const L = KITS.length;
const PRE = {};
KITS.forEach((k) => { const i = new Image(); i.src = k.image; PRE[k.id] = i; });
const ratioOf = (k) => { const i = PRE[k.id]; return i.naturalWidth && i.naturalHeight ? i.naturalWidth / i.naturalHeight : 0.8; };
const contain = (bw, bh, r) => (r > bw / bh ? [bw, bw / r] : [bh * r, bh]);
const mark = (k) => `<div class="jersey-mark"><span class="${k.number.length > 1 ? 'foil-num' : 'foil-num is-single'}">${k.number}</span>${k.edition ? `<span class="foil-edition">${k.edition}</span><span class="foil-sub">${k.sub}</span>` : ''}</div>`;

/* =============== HERO =============== */
const stage = $('#home'), copyEl = $('#copy'), jerseys = $('#jerseys'), capEl = $('#caption'), thumb = $('#next-img');
let cur = 0, busy = false, hHover = false, hTimer;

$('.glow-field').innerHTML = KITS.map((k, i) => `<div class="glow" data-kit="${k.id}" data-on="${i === 0}" style="--g:${k.glow}"></div>`).join('') + Array.from({ length: 14 }, (_, i) => `<span class="mote" style="left:${6 + i * 6.6}%;animation-delay:${(i * 1.7) % 7}s;animation-duration:${7 + (i % 4)}s"></span>`).join('');
$('#swatches').innerHTML = KITS.map((k, i) => `<button type="button" class="swatch${i ? '' : ' is-active'}" data-i="${i}" aria-label="${k.name}" style="--dot:${k.glow}"></button>`).join('');
$('#dots').innerHTML = KITS.map((k, i) => `<button type="button" class="hero-dot${i ? '' : ' is-active'}" data-i="${i}" aria-label="Show ${k.name}"><span></span></button>`).join('');

const jerseyHTML = (k) => `<div class="jersey-float"><div class="jersey-visual"><img src="${k.image}" alt="${k.name} football jersey" draggable="false">${mark(k)}</div></div>`;
const copyHTML = (k) => `<h1 class="hero-title"><span class="line"><span>${k.h[0]}</span></span><span class="line accent"><span>${k.h[1]}</span></span></h1><p class="hero-body">${k.body}</p><div class="cta-row"><button class="btn btn-solid" type="button" data-quote>Get the look</button><button class="btn btn-ghost" type="button" data-quote>Request a quote</button></div><ul class="tags">${k.tags.map((t) => `<li>${t}</li>`).join('')}</ul>`;
const capHTML = (k) => `<strong>${k.name}</strong><span>${k.cap}</span>`;

function mountCopy(k, first) {
  const d = document.createElement('div');
  d.className = 'hero-copy' + (first ? ' is-first' : '');
  d.innerHTML = copyHTML(k);
  copyEl.append(d);
  $$('[data-quote]', d).forEach((b) => (b.onclick = () => $('#cta').scrollIntoView({ behavior: 'smooth' })));
}
function mountFirst() {
  const k = KITS[0];
  mountCopy(k, true);
  const jl = document.createElement('div');
  jl.className = 'jersey-layer jersey-in is-first';
  jl.innerHTML = jerseyHTML(k);
  jerseys.append(jl);
  capEl.innerHTML = capHTML(k);
  capEl.classList.add('is-first');
  thumb.src = KITS[1].image;
}
mountFirst();

/* The video's exact sequence:
   1. shirt blurs out in place while the backdrop washes to the new colour
   2. the little shirt lifts out of the corner and flies up to centre, growing
   3. it lands as the hero shirt, headline + caption resolve, next thumbnail appears */
function setKit(n) {
  n = (n + L) % L;
  if (n === cur || busy) return;
  busy = true; clearTimeout(hTimer);
  const k = KITS[n];
  const dir = ((n - cur + L) % L) <= L / 2 ? 1 : -1;
  stage.style.setProperty('--dir', dir);
  cur = n;

  // t=0 — old shirt + copy dissolve, backdrop begins to shift
  $$('.jersey-layer', jerseys).forEach((c) => { c.classList.remove('jersey-in'); c.classList.add('is-leaving', 'jersey-out'); setTimeout(() => c.remove(), 650); });
  $$('.hero-copy', copyEl).forEach((c) => { c.classList.add('is-leaving'); c.setAttribute('inert', ''); setTimeout(() => c.remove(), 600); });
  capEl.classList.remove('is-first'); capEl.classList.add('is-out');
  stage.classList.add('is-shifting'); setTimeout(() => stage.classList.remove('is-shifting'), 1100);
  stage.dataset.colorway = k.id;
  $$('.glow').forEach((g) => (g.dataset.on = String(g.dataset.kit === k.id)));
  $$('.swatch').forEach((s, i) => s.classList.toggle('is-active', i === n));
  $$('.hero-dot').forEach((s, i) => { s.classList.toggle('is-active', i === n); const sp = $('span', s); sp.style.animation = 'none'; sp.offsetWidth; sp.style.animation = ''; });
  $('#code').textContent = k.code;
  $('#pager-count').textContent = String(n + 1).padStart(2, '0') + ' / 0' + L;

  // the incoming (real) shirt is laid out but hidden, so we know exactly where to land
  const jl = document.createElement('div');
  jl.className = 'jersey-layer hold';
  jl.style.opacity = '0';
  jl.innerHTML = jerseyHTML(k);
  jerseys.append(jl);

  // t=220 — little shirt takes off
  setTimeout(() => {
    const tr = thumb.getBoundingClientRect();
    const r = ratioOf(k);
    const [w, h] = contain(tr.width, tr.height, r);
    const cx = tr.left + tr.width / 2, cy = tr.top + tr.height / 2;
    const t = $('.jersey-visual img', jl).getBoundingClientRect();
    const [tw] = contain(t.width, t.height, r);
    const dx = t.left + t.width / 2 - cx, dy = t.top + t.height / 2 - cy, s = tw / w;
    const clone = new Image();
    clone.src = k.image; clone.alt = '';
    Object.assign(clone.style, { position: 'fixed', left: cx - w / 2 + 'px', top: cy - h / 2 + 'px', width: w + 'px', height: h + 'px', zIndex: 60, pointerEvents: 'none', transformOrigin: '50% 50%', willChange: 'transform,opacity', filter: 'drop-shadow(0 20px 26px rgba(0,0,0,.5))' });
    document.body.append(clone);
    thumb.style.opacity = '0';
    const D = 780;
    clone.animate([
      { transform: 'translate(0,0) scale(1) rotate(-8deg)', offset: 0 },
      { transform: `translate(${dx * 0.42}px,${dy * 0.5 - 46}px) scale(${1 + (s - 1) * 0.42}) rotate(5deg)`, offset: 0.5 },
      { transform: `translate(${dx}px,${dy}px) scale(${s}) rotate(0deg)`, offset: 1 }
    ], { duration: D, easing: 'cubic-bezier(.45,.05,.2,1)', fill: 'forwards' });

    // t≈220+D — land: swap clone for the real shirt, headline + caption resolve
    setTimeout(() => {
      jl.style.opacity = '1';
      jl.classList.remove('hold');
      jl.classList.add('landed');
      clone.remove();
      mountCopy(k, false);
      capEl.innerHTML = capHTML(k);
      capEl.classList.remove('is-out');
      capEl.style.animation = 'none'; capEl.offsetWidth; capEl.style.animation = '';
      thumb.src = KITS[(n + 1) % L].image;
      requestAnimationFrame(() => (thumb.style.opacity = '1'));
    }, D - 60);
    setTimeout(() => { busy = false; schedule(); }, D + 120);
  }, 220);
}
function schedule() {
  clearTimeout(hTimer);
  hTimer = setTimeout(() => (hHover || document.hidden || busy ? schedule() : setKit(cur + 1)), 7000);
}
$('#prev').onclick = () => setKit(cur - 1);
$('#next').onclick = () => setKit(cur + 1);
$('#next-kit').onclick = () => setKit(cur + 1);
$$('.swatch').forEach((s) => (s.onclick = () => setKit(+s.dataset.i)));
$$('.hero-dot').forEach((s) => (s.onclick = () => setKit(+s.dataset.i)));
$$('#sizes button').forEach((b) => (b.onclick = () => $$('#sizes button').forEach((x) => x.classList.toggle('is-on', x === b))));
stage.addEventListener('mouseenter', () => (hHover = true));
stage.addEventListener('mouseleave', () => { hHover = false; stage.style.setProperty('--mx', 0); stage.style.setProperty('--my', 0); });
stage.addEventListener('mousemove', (e) => {
  if (matchMedia('(pointer: coarse)').matches) return;
  const r = stage.getBoundingClientRect();
  stage.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
  stage.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
});
document.addEventListener('keydown', (e) => {
  if (e.target !== document.body || !$('#lb').hidden) return;
  if (e.key === 'ArrowRight') setKit(cur + 1);
  if (e.key === 'ArrowLeft') setKit(cur - 1);
});
setTimeout(schedule, 2300);

/* =============== HEADER =============== */
const header = $('#header'), toggle = $('.menu-toggle'), mnav = $('#mobile-nav');
addEventListener('scroll', () => header.classList.toggle('is-stuck', scrollY > 12), { passive: true });
toggle.onclick = () => { const o = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', o); mnav.hidden = !o; header.classList.toggle('is-stuck', o || scrollY > 12); };
$$('a', mnav).forEach((a) => (a.onclick = () => { toggle.setAttribute('aria-expanded', 'false'); mnav.hidden = true; }));

/* =============== WORKS: scroll-driven carousel =============== */
const works = $('#works'), strip = $('#strip'), N = WORKS.length;
let wi = -1, startX = null;
strip.innerHTML = WORKS.map((w, i) => `<article class="slice" data-active="false" style="--rel:${i}"><button type="button" class="slice-hit" aria-label="${w[0]}"><span class="slice-media"><img src="${w[3]}" alt="${w[0]}" draggable="false"></span><span class="slice-shade"></span><span class="slice-no">0${i + 1}</span><span class="slice-label">${w[0]}</span><span class="slice-cap"><span class="work-badge">${w[2]}</span><span class="cap-title">${w[0]}</span><span class="cap-detail">${w[1]}</span></span></button></article>`).join('');
const slices = $$('.slice', strip);
function showWork(i) {
  if (i === wi) return;
  wi = i;
  slices.forEach((s, j) => { s.dataset.active = String(j === i); s.style.setProperty('--rel', j - i); });
  const w = WORKS[i];
  const c = $('#works-copy'); c.style.animation = 'none'; c.offsetWidth; c.style.animation = '';
  c.innerHTML = `<p class="works-title">${w[0]}</p><p class="works-detail">${w[1]}</p>`;
  $('#works-index').textContent = `0${i + 1} / 0${N}`;
}
const span = () => works.offsetHeight - innerHeight;
const worksTop = () => works.getBoundingClientRect().top + scrollY;
function goWork(i) { i = Math.max(0, Math.min(N - 1, i)); scrollTo({ top: worksTop() + ((i + 0.5) / N) * span(), behavior: 'smooth' }); }
let ticking = false;
function onScroll() {
  ticking = false;
  const p = Math.max(0, Math.min(1, -works.getBoundingClientRect().top / span()));
  $('#progress').style.transform = `scaleX(${p})`;
  showWork(Math.min(N - 1, Math.floor(p * N)));
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', onScroll);
slices.forEach((s, i) => s.addEventListener('click', () => { if (i !== wi) goWork(i); else $('#home').scrollIntoView({ behavior: 'smooth' }); }));
$('#w-prev').onclick = () => goWork(wi - 1);
$('#w-next').onclick = () => goWork(wi + 1);
strip.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); goWork(wi + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); goWork(wi - 1); } });
strip.addEventListener('pointerdown', (e) => (startX = e.clientX));
strip.addEventListener('pointerup', (e) => { if (startX === null) return; const d = e.clientX - startX; startX = null; if (Math.abs(d) > 48) goWork(wi + (d < 0 ? 1 : -1)); });
onScroll();

/* =============== SQUAD GRID + LIGHTBOX =============== */
const grid = $('#sq-grid');
grid.innerHTML = KITS.map((k, i) => `<button type="button" class="sq-card rv" data-i="${i}" data-kit="${k.id}" style="--g:${k.glow};--d:${i * 70}ms"><span class="sq-art"><img src="${k.image}" alt="${k.name}" draggable="false">${mark(k)}</span><span class="sq-meta"><em>${k.code}</em><b>${k.name}</b></span><span class="sq-plus" aria-hidden="true">+</span></button>`).join('');
$$('.sq-card', grid).forEach((c) => {
  c.addEventListener('mousemove', (e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--ry', (((e.clientX - r.left) / r.width) * 2 - 1) * 9 + 'deg');
    c.style.setProperty('--rx', (((e.clientY - r.top) / r.height) * 2 - 1) * -9 + 'deg');
  });
  c.addEventListener('mouseleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
  c.addEventListener('click', () => openLb(+c.dataset.i, c));
});
const lb = $('#lb'), lbCard = $('#lb-card'), lbBg = $('#lb-bg');
let lbIndex = 0, lbSrc = null, lbAnim = null;
const targetRect = () => { const w = Math.min(980, innerWidth - 28), h = Math.min(innerWidth < 760 ? 640 : 560, innerHeight - 48); return { left: (innerWidth - w) / 2, top: (innerHeight - h) / 2, width: w, height: h }; };
const px = (r, br) => ({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: br + 'px' });
function fillLb(k, i) {
  lbCard.style.setProperty('--g', k.glow);
  lbCard.innerHTML = `<div class="lb-art"><div class="jersey-visual"><img src="${k.image}" alt="${k.name}" draggable="false">${mark(k)}</div></div><div class="lb-info"><p class="kicker">${k.code} · 0${i + 1} / 0${L}</p><h3>${k.name}</h3><p class="lb-body">${k.body}</p><ul class="tags">${k.tags.map((t) => `<li>${t}</li>`).join('')}</ul><div class="cta-row"><button class="btn btn-solid" type="button" id="lb-quote">Request a quote</button><button class="btn btn-ghost" type="button" id="lb-show">Show in hero</button></div></div><button class="lb-x" type="button" id="lb-close" aria-label="Close">✕</button><button class="lb-nav prev" type="button" id="lb-prev" aria-label="Previous kit">‹</button><button class="lb-nav next" type="button" id="lb-next" aria-label="Next kit">›</button>`;
  $('#lb-close').onclick = closeLb;
  $('#lb-prev').onclick = () => stepLb(-1);
  $('#lb-next').onclick = () => stepLb(1);
  $('#lb-quote').onclick = () => { closeLb(); setTimeout(() => $('#cta').scrollIntoView({ behavior: 'smooth' }), 450); };
  $('#lb-show').onclick = () => { closeLb(); setTimeout(() => { $('#home').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => setKit(lbIndex), 700); }, 450); };
}
function openLb(i, card) {
  lbIndex = i; lbSrc = card;
  fillLb(KITS[i], i);
  lb.hidden = false; lbCard.classList.remove('ready'); document.body.style.overflow = 'hidden';
  const from = card.getBoundingClientRect();
  lbBg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, fill: 'forwards', easing: 'ease-out' });
  lbAnim = lbCard.animate([px(from, 22), px(targetRect(), 28)], { duration: 640, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
  card.style.visibility = 'hidden';
  setTimeout(() => lbCard.classList.add('ready'), 360);
}
function stepLb(d) {
  lbIndex = (lbIndex + d + L) % L;
  lbCard.classList.remove('ready'); lbCard.classList.add('swap');
  setTimeout(() => { fillLb(KITS[lbIndex], lbIndex); lbCard.classList.remove('swap'); lbCard.classList.add('ready'); if (lbSrc) lbSrc.style.visibility = ''; lbSrc = $$('.sq-card')[lbIndex]; lbSrc.style.visibility = 'hidden'; }, 260);
}
function closeLb() {
  if (lb.hidden) return;
  lbCard.classList.remove('ready');
  const card = $$('.sq-card')[lbIndex];
  if (lbSrc && lbSrc !== card) lbSrc.style.visibility = '';
  const to = card.getBoundingClientRect();
  lbBg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, fill: 'forwards' });
  lbCard.animate([px(targetRect(), 28), px(to, 22)], { duration: 520, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).finished.then(() => { lb.hidden = true; card.style.visibility = ''; document.body.style.overflow = ''; lbSrc = null; }).catch(() => {});
}
lbBg.onclick = closeLb;
addEventListener('keydown', (e) => { if (lb.hidden) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowRight') stepLb(1); if (e.key === 'ArrowLeft') stepLb(-1); });
addEventListener('resize', () => { if (!lb.hidden) { lbCard.getAnimations().forEach((a) => a.cancel()); Object.assign(lbCard.style, px(targetRect(), 28)); } });

/* =============== CTA FAN =============== */
$('#fan').innerHTML = KITS.map((k, i) => { const m = i - (L - 1) / 2; return `<div class="fan-item" style="--m:${m};--d:${i * 90}ms"><img src="${k.image}" alt="">${mark(k).replace('jersey-mark', 'jersey-mark fan-mark')}</div>`; }).join('');
$('#cta-quote').onclick = () => { const n = $('#cta-quote'); n.textContent = 'Thanks — we’ll be in touch'; n.disabled = true; };

/* =============== REVEAL ON SCROLL =============== */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
$$('.rv').forEach((el) => io.observe(el));
