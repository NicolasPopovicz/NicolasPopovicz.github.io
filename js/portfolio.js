/* ============================================================
   portfolio.js — Nicolas Popovicz Portfolio
   Usado pela versão em português (/) e em inglês (/en/).
   ============================================================ */

/* ── STATE ─────────────────────────────────────────────────── */
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isEN = document.documentElement.lang.toLowerCase().startsWith('en');

const storage = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage bloqueado */ } },
};

/* ── YEARS OF EXPERIENCE (não fica desatualizado) ────────────── */
function yearsSince(yyyymm) {
  const [y, m] = yyyymm.split('-').map(Number);
  const now = new Date();
  let years = now.getFullYear() - y;
  if (now.getMonth() + 1 < m) years--;
  return years;
}
const EXP_SINCE = '2021-02';
const expYears = yearsSince(EXP_SINCE);
document.querySelectorAll('[data-years-since]').forEach(el => {
  el.textContent = yearsSince(el.dataset.yearsSince);
});

/* ── TEXTOS POR IDIOMA ───────────────────────────────────────── */
const T = isEN ? {
  locale: 'en-US',
  phrases: [
    'Senior Software Developer @ Fruitfy',
    'Back-end · PHP · Laravel · Node.js',
    'Performance · Queues · Integrations',
    `${expYears}+ years building production systems`,
    'Open to opportunities and freelance',
  ],
  bootLoad: 'Loading modules',
  bootCompile: (c, s) => `Compiling <span class="b">${c}</span> companies, <span class="b">${s}</span> skills, <span class="b">${expYears}+</span> years...`,
  bootCompileShort: (s) => `Compiling <span class="b">${s}</span> skills, <span class="b">${expYears}+</span> years...`,
  bootInit: 'Initializing',
  ready: 'ready in',
  noRepos: 'No public repositories found.',
  noDesc: 'No description available.',
  reposError: 'Could not load the repositories.<br>See them on GitHub:',
  themeLabel: (name) => `Color theme: ${name}. Click to switch`,
  menuOpen: 'Open menu', menuClose: 'Close menu',
} : {
  locale: 'pt-BR',
  phrases: [
    'Senior Software Developer @ Fruitfy',
    'Back-end · PHP · Laravel · Node.js',
    'Performance · Filas · Integrações',
    `${expYears}+ anos construindo sistemas em produção`,
    'Aberto a oportunidades e freelas',
  ],
  bootLoad: 'Carregando módulos',
  bootCompile: (c, s) => `Compilando <span class="b">${c}</span> empresas, <span class="b">${s}</span> skills, <span class="b">${expYears}+</span> anos...`,
  bootCompileShort: (s) => `Compilando <span class="b">${s}</span> skills, <span class="b">${expYears}+</span> anos...`,
  bootInit: 'Inicializando',
  ready: 'ready em',
  noRepos: 'Nenhum repositório público encontrado.',
  noDesc: 'Sem descrição disponível.',
  reposError: 'Não foi possível carregar os repositórios.<br>Veja direto no GitHub:',
  themeLabel: (name) => `Tema de cores: ${name}. Clique para trocar`,
  menuOpen: 'Abrir menu', menuClose: 'Fechar menu',
};

/* ── SCROLL (RAF-throttled, single listener) ─────────────────── */
const progress = document.getElementById('progress');
const navEl = document.getElementById('nav');
const navAnchors = document.querySelectorAll('.nav-links a');
// seções derivadas dos links do menu (mesma ordem da página), vale para os dois idiomas
const sections = [...navAnchors]
  .map(a => document.getElementById(a.getAttribute('href').slice(1)))
  .filter(Boolean);
const orb1 = document.querySelector('.orb1');
const orb2 = document.querySelector('.orb2');
const btt = document.getElementById('back-to-top');

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      const pct = sy / (document.body.scrollHeight - window.innerHeight) * 100;
      progress.style.width = pct + '%';
      navEl.classList.toggle('scrolled', sy > 40);
      btt.classList.toggle('visible', sy > 400);

      if (!isTouchDevice && !reduceMotion) {
        if (orb1) orb1.style.transform = 'translate3d(0,' + (sy * .25) + 'px,0)';
        if (orb2) orb2.style.transform = 'translate3d(0,' + (-sy * .15) + 'px,0)';
      }

      const y = sy + 200;
      let active = '';
      sections.forEach(s => { if (s.offsetTop <= y) active = '#' + s.id; });
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === active));

      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

/* ── MOBILE MENU ─────────────────────────────────────────────── */
const burger = document.getElementById('nav-burger');
function setMenu(open) {
  navEl.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? T.menuClose : T.menuOpen);
}
if (burger) {
  burger.addEventListener('click', () => setMenu(!navEl.classList.contains('menu-open')));
  navAnchors.forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => {
    if (navEl.classList.contains('menu-open') && !navEl.contains(e.target)) setMenu(false);
  });
}

/* ── INTERSECTION OBSERVER ──────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .reveal-left').forEach(el => observer.observe(el));

/* ── GITHUB REPOS ───────────────────────────────────────────── */
const langColors = {
  PHP: '#777bb4', TypeScript: '#3178c6', JavaScript: '#f1e05a',
  Python: '#3572A5', HTML: '#e34c26', CSS: '#563d7c',
  Vue: '#41b883', Shell: '#89e051', Go: '#00ADD8'
};

const escapeHTML = (s) => String(s).replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

async function loadRepos() {
  const grid = document.getElementById('projects-grid');
  try {
    const res = await fetch('https://api.github.com/users/NicolasPopovicz/repos?sort=updated&per_page=12&type=public');
    if (!res.ok) throw new Error('API error');
    const repos = await res.json();

    const filtered = repos
      .filter(r => !r.fork && r.name !== 'NicolasPopovicz')
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) || new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 9);

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="project-loading">${T.noRepos}</div>`;
      return;
    }

    grid.innerHTML = filtered.map((repo, i) => {
      const lang = repo.language || 'Other';
      const color = langColors[lang] || '#8895b0';
      const desc = repo.description
        ? repo.description.slice(0, 100) + (repo.description.length > 100 ? '…' : '')
        : T.noDesc;
      const updated = new Date(repo.updated_at).toLocaleDateString(T.locale, { month: 'short', year: 'numeric' });
      return `
        <a href="${escapeHTML(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="project-card reveal" style="transition-delay:${i * 0.06}s">
          <div class="project-header">
            <h3 class="project-name">${escapeHTML(repo.name)}</h3>
            <div class="project-arrow" aria-hidden="true">↗</div>
          </div>
          <div class="project-desc">${escapeHTML(desc)}</div>
          <div class="project-footer">
            <div class="project-lang">
              <div class="lang-dot" style="background:${color}"></div>
              ${escapeHTML(lang)}
            </div>
            <div class="project-stars">
              ${repo.stargazers_count > 0 ? `⭐ ${repo.stargazers_count}` : updated}
            </div>
          </div>
        </a>`;
    }).join('');

    grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } catch (err) {
    grid.innerHTML = `
      <div class="project-loading" style="grid-column:1/-1">
        <p style="margin-bottom:16px">${T.reposError}</p>
        <a href="https://github.com/NicolasPopovicz" target="_blank" rel="noopener noreferrer" class="btn-primary" style="display:inline-block">github.com/NicolasPopovicz</a>
      </div>`;
  }
}

loadRepos();

/* ── CUSTOM CURSOR (desktop only) ───────────────────────────── */
if (!isTouchDevice) {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  const body = document.body;
  body.classList.add('custom-cursor');

  // só o que é clicável de verdade muda o cursor
  const CLICKABLE = 'a[href], button:not(:disabled), [role="button"], label[for], summary';
  const NAV_OFFSET = 72; // altura do menu fixo (mesmo valor do scroll-padding-top)

  // dica mostrada dentro do cursor: para onde o clique leva
  function cursorIcon(el) {
    if (el.tagName !== 'A') return '';
    const href = el.getAttribute('href') || '';
    if (href.startsWith('mailto:')) return '@';
    if (href.startsWith('#')) {
      const target = document.getElementById(href.slice(1));
      if (!target) return '';
      const dist = target.getBoundingClientRect().top - NAV_OFFSET;
      if (Math.abs(dist) < 40) return '';
      return dist < 0 ? '↑' : '↓';
    }
    if (el.target === '_blank') return '↗';
    return '→';
  }

  function moveCursor(e) {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = ring.style.left = mx + 'px';
    cursor.style.top = ring.style.top = my + 'px';
    body.classList.add('cursor-ready');
    body.classList.remove('cursor-hidden');
  }
  window.addEventListener('mousemove', moveCursor, { passive: true });

  // um único listener decide o estado: entrar num filho de um link continua "sobre o link"
  document.addEventListener('mouseover', (e) => {
    moveCursor(e);
    const el = e.target.closest(CLICKABLE);
    body.classList.toggle('cursor-hover', !!el);
    ring.dataset.icon = el ? cursorIcon(el) : '';
  }, { passive: true });

  // mouse saiu da janela: esconde em vez de deixar o cursor parado na borda
  window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) body.classList.add('cursor-hidden');
  });
  document.addEventListener('mousedown', () => body.classList.add('cursor-down'));
  document.addEventListener('mouseup', () => body.classList.remove('cursor-down'));
}

/* ── LOADER ─────────────────────────────────────────────────── */
/* Roda só na primeira visita da aba; com "reduzir movimento" nem aparece
   (a classe .no-loader é aplicada por um script inline no <head>). */
const loaderEl = document.getElementById('loader');
const loaderLines = document.getElementById('loaderLines');
const loaderProg = document.getElementById('loaderProg');
const skipLoader = document.documentElement.classList.contains('no-loader');
try { sessionStorage.setItem('np-booted', '1'); } catch (e) { /* storage bloqueado */ }

const nCompanies = document.querySelectorAll('.exp-item').length;
const nSkills = document.querySelectorAll('.skill-tag').length;

const bootLines = isTouchDevice
  ? [
      '<span class="d">$</span> <span class="g">npm</span> run <span class="y">build:portfolio</span>',
      `<span class="d">›</span> ${T.bootCompileShort(nSkills)}`,
      '<span class="d">›</span> <span class="ok">✓ ready</span>',
    ]
  : [
      '<span class="d">$</span> <span class="g">npm</span> run <span class="y">build:portfolio</span>',
      `<span class="d">›</span> ${T.bootLoad} <span class="p">@nicolas/core</span>...`,
      `<span class="d">›</span> ${T.bootCompile(nCompanies, nSkills)}`,
      `<span class="d">›</span> ${T.bootInit} <span class="p">canvas</span> + <span class="p">animations</span>...`,
      `<span class="d">›</span> <span class="ok">✓ ${T.ready}</span> <span class="y">1.2s</span>`,
    ];

function bootStep(i = 0) {
  if (i < bootLines.length) {
    const l = document.createElement('div');
    l.className = 'loader-line'; l.innerHTML = bootLines[i];
    loaderLines.appendChild(l);
    requestAnimationFrame(() => l.classList.add('show'));
    setTimeout(() => bootStep(i + 1), 280);
  }
}

function finishLoader() {
  loaderEl.classList.add('done');
  document.body.style.overflow = '';
  if (!reduceMotion) startHeroAnimations();
}

if (skipLoader) {
  finishLoader();
} else {
  document.body.style.overflow = 'hidden';
  bootStep();
  let lp = 0;
  const lpTimer = setInterval(() => {
    lp += Math.random() * 7 + 2;
    if (lp >= 100) { lp = 100; clearInterval(lpTimer); setTimeout(finishLoader, 400); }
    loaderProg.style.width = lp + '%';
  }, 80);
}

/* ── HERO ENTRY ANIMATIONS ───────────────────────────────────── */
function startHeroAnimations() {
  const tag = document.querySelector('.hero-available');
  const name = document.querySelector('.hero-name span');
  const role = document.querySelector('.hero-role');
  const desc = document.querySelector('.hero-desc');
  const acts = document.querySelector('.hero-actions');
  const card = document.querySelector('.hero-card');
  const hint = document.querySelector('.scroll-hint');

  [tag, role, desc, acts, card].forEach(el => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = el === card ? 'translateX(40px)' : 'translateY(18px)';
    el.style.transition = 'opacity .8s ease, transform .8s ease';
  });
  if (name) {
    name.style.transform = 'translateY(110%)';
    name.style.transition = 'transform .9s cubic-bezier(.16,1,.3,1)';
  }

  setTimeout(() => { if (tag) { tag.style.opacity = '1'; tag.style.transform = 'none'; } }, 150);
  setTimeout(() => { if (name) name.style.transform = 'translateY(0)'; }, 350);
  setTimeout(() => { if (role) { role.style.opacity = '1'; role.style.transform = 'none'; } startTypewriter(); }, 700);
  setTimeout(() => { if (desc) { desc.style.opacity = '1'; desc.style.transform = 'none'; } }, 900);
  setTimeout(() => { if (acts) { acts.style.opacity = '1'; acts.style.transform = 'none'; } }, 1050);
  setTimeout(() => { if (card) { card.style.opacity = '1'; card.style.transform = 'none'; } }, 1200);
  setTimeout(() => { if (hint) { hint.style.opacity = '1'; hint.style.transform = 'translateX(-50%)'; } }, 2400);

  startCanvasParticles();
}

/* ── TYPEWRITER ──────────────────────────────────────────────── */
function startTypewriter() {
  const target = document.getElementById('typeTarget');
  if (!target) return;
  const phrases = T.phrases;
  let p = 0, c = 0, erasing = false;
  function tick() {
    const cur = phrases[p];
    if (!erasing) {
      target.textContent = cur.slice(0, c + 1); c++;
      if (c === cur.length) { erasing = true; return setTimeout(tick, 1800); }
      setTimeout(tick, 45 + Math.random() * 40);
    } else {
      target.textContent = cur.slice(0, c - 1); c--;
      if (c === 0) { erasing = false; p = (p + 1) % phrases.length; return setTimeout(tick, 300); }
      setTimeout(tick, 25);
    }
  }
  tick();
}

/* ── CANVAS PARTICLES ────────────────────────────────────────── */
function startCanvasParticles() {
  const c = document.getElementById('hero-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, particles = [];
  const PARTICLE_COUNT = isTouchDevice ? 12 : 30;

  function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      r: Math.random() * 1.6 + .4,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.strokeStyle = 'rgba(109,95,250,' + (.05 * (1 - d / 100)) + ')';
          ctx.lineWidth = .6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      if (!isTouchDevice) {
        const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) { p.x += dx / d * .6; p.y += dy / d * .6; }
      }
      ctx.fillStyle = 'rgba(167,139,250,.12)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── MAGNETIC BUTTONS (desktop only) ────────────────────────── */
if (!isTouchDevice && !reduceMotion) {
  document.querySelectorAll('.btn-primary,.btn-secondary,.nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = 'translate(' + (x * .18) + 'px,' + (y * .25) + 'px)';
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ── HOVER FX (event-delegated, single listener) ─────────────── */
/* Só nos títulos, e só efeitos sutis (sem brilho nem sombra).
   Os cards usam apenas o hover do CSS: sobem 4px e a borda ganha a cor do tema. */
const hoverFXText = ['fx-float', 'fx-color'];
const hoverFXTouch = ['fx-color'];

const FX_TEXT_SEL = 'h2,.section-tag,.skill-cat,.card-label,.exp-company-name,.project-name,.case-title,.edu-school,.lang-name,.footer-logo';

function triggerHoverFX(el, pool) {
  if (el.dataset.fxActive) return;
  const cls = pool[Math.floor(Math.random() * pool.length)];
  el.dataset.fxActive = '1';
  el.classList.add(cls);
  setTimeout(() => { el.classList.remove(cls); delete el.dataset.fxActive; }, 500);
}

if (reduceMotion) {
  /* sem efeitos de hover */
} else if (!isTouchDevice) {
  document.addEventListener('mouseover', (e) => {
    // dispara só ao ENTRAR no elemento, não a cada filho que o mouse cruza
    const textEl = e.target.closest(FX_TEXT_SEL);
    if (textEl && !textEl.contains(e.relatedTarget)) triggerHoverFX(textEl, hoverFXText);
  }, { passive: true });
} else {
  document.addEventListener('touchstart', (e) => {
    const el = e.target.closest(FX_TEXT_SEL);
    if (el) triggerHoverFX(el, hoverFXTouch);
  }, { passive: true });
}

/* ── THEME TOGGLE ────────────────────────────────────────────── */
/* As cores de cada tema estão no CSS (:root[data-theme="..."]).
   O script inline do <head> aplica o tema salvo antes da página aparecer. */
const THEMES = [
  { id: 'purple', name: 'Purple' },
  { id: 'matrix', name: 'Matrix' },
  { id: 'cyber', name: 'Cyber' },
  { id: 'amber', name: 'Amber' },
];
const themeBtn = document.getElementById('theme-toggle');
const currentTheme = () => document.documentElement.dataset.theme || 'purple';

function applyTheme(id) {
  if (id === 'purple') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = id;
  const t = THEMES.find(x => x.id === id) || THEMES[0];
  if (themeBtn) {
    themeBtn.setAttribute('aria-label', T.themeLabel(t.name));
    themeBtn.title = T.themeLabel(t.name);
  }
}

function switchTheme() {
  const i = THEMES.findIndex(t => t.id === currentTheme());
  const next = THEMES[(i + 1) % THEMES.length].id;
  storage.set('np-theme', next);
  if (reduceMotion) { applyTheme(next); return; }

  document.body.classList.add('theme-glitching');
  setTimeout(() => {
    document.body.classList.add('theme-changing');
    applyTheme(next);
    setTimeout(() => document.body.classList.remove('theme-changing', 'theme-glitching'), 900);
  }, 150);
}

applyTheme(currentTheme());
if (themeBtn) themeBtn.addEventListener('click', switchTheme);

/* ── EASTER EGG: MATRIX RAIN ─────────────────────────────────── */
function matrixRain() {
  const overlay = document.createElement('canvas');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9997;pointer-events:none;opacity:0;transition:opacity 0.4s';
  document.body.appendChild(overlay);
  const ctx = overlay.getContext('2d');
  overlay.width = window.innerWidth;
  overlay.height = window.innerHeight;

  const cols = Math.floor(overlay.width / 14);
  const drops = Array(cols).fill(1);
  const chars = 'アイウエオカキクケコサシスセソタチツテト01ニヌネノハヒフヘホ!@#$%^&*';

  requestAnimationFrame(() => { overlay.style.opacity = '1'; });

  const theme = currentTheme();
  let frame = 0;
  const interval = setInterval(() => {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, 0, overlay.width, overlay.height);
    ctx.fillStyle = theme === 'matrix' ? '#39ff14' : (theme === 'cyber' ? '#00e5ff' : '#00ff41');
    ctx.font = '14px monospace';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * 14, y * 14);
      if (y * 14 > overlay.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
    frame++;
    if (frame > 160) {
      clearInterval(interval);
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 400);
    }
  }, 16);
}

/* ── EASTER EGG: TEXT SCRAMBLE ───────────────────────────────── */
function textScramble() {
  const glitchChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?';
  document.querySelectorAll('h2').forEach(el => {
    if (el.dataset.scrambling) return;
    el.dataset.scrambling = '1';
    const originalHTML = el.innerHTML; // preserva o <em> colorido do título
    const original = el.textContent;
    let iterations = 0;
    const interval = setInterval(() => {
      el.textContent = original.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (i < Math.floor(iterations)) return original[i];
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }).join('');
      iterations += 0.4;
      if (iterations >= original.length) {
        el.innerHTML = originalHTML;
        delete el.dataset.scrambling;
        clearInterval(interval);
      }
    }, 30);
  });
}

/* ── EASTER EGG: EMOJI BOMB ──────────────────────────────────── */
function emojiBomb() {
  const emojis = ['🚀', '💻', '☕', '🎮', '🐍', '⚡', '🔥', '💜', '🛠️', '📦', '🌙', '✨', '🎯', '🧪', '🦄'];
  for (let i = 0; i < 18; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      const size = 20 + Math.random() * 24;
      const startX = Math.random() * 100;
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `
        position:fixed;
        left:${startX}vw;
        top:-60px;
        font-size:${size}px;
        z-index:9998;
        pointer-events:none;
        transition:top ${1.8 + Math.random() * 0.8}s cubic-bezier(.4,0,.2,1), opacity 0.5s ease ${1.5}s;
        opacity:1;
        will-change:top;
      `;
      document.body.appendChild(el);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.top = (75 + Math.random() * 20) + 'vh';
        el.style.opacity = '0';
      }));
      setTimeout(() => el.remove(), 3000);
    }, i * 80);
  }
}

/* ── EASTER EGG: PARTY MODE ──────────────────────────────────── */
function partyMode() {
  let count = 0;
  const interval = setInterval(() => {
    if (count++ > 60) { clearInterval(interval); return; }
    const spark = document.createElement('div');
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 180;
    const startX = isTouchDevice ? window.innerWidth / 2 : mx;
    const startY = isTouchDevice ? window.innerHeight / 2 : my;
    spark.style.cssText = `
      position:fixed;
      left:${startX}px;
      top:${startY}px;
      width:8px;height:8px;
      border-radius:50%;
      background:hsl(${Math.random() * 360},100%,65%);
      pointer-events:none;z-index:9998;
      transition:transform 1.2s ease-out, opacity 1.2s ease-out;
      transform:translate(-50%,-50%);
      opacity:1;
    `;
    document.body.appendChild(spark);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      spark.style.transform = `translate(${Math.cos(angle) * dist - 4}px, ${Math.sin(angle) * dist - 4}px) scale(0)`;
      spark.style.opacity = '0';
    }));
    setTimeout(() => spark.remove(), 1200);
  }, 25);
}

/* ── EASTER EGGS: só sob demanda (Konami code ou botão do rodapé) ── */
const easterEggs = [matrixRain, textScramble, emojiBomb, partyMode];
let lastEgg = -1;
function runEasterEgg() {
  let i;
  do { i = Math.floor(Math.random() * easterEggs.length); } while (i === lastEgg);
  lastEgg = i;
  easterEggs[i]();
}

let konamiSeq = [];
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
document.addEventListener('keydown', e => {
  konamiSeq.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  if (konamiSeq.length > KONAMI.length) konamiSeq.shift();
  if (konamiSeq.join(',') === KONAMI.join(',')) {
    konamiSeq = [];
    runEasterEgg();
  }
});

const eggBtn = document.getElementById('footer-egg');
if (eggBtn) eggBtn.addEventListener('click', runEasterEgg);

/* ── FOOTER YEAR ─────────────────────────────────────────────── */
const fyEl = document.getElementById('footer-year');
if (fyEl) fyEl.textContent = new Date().getFullYear();
