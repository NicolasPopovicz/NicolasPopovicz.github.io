/* ============================================================
   portfolio.js — Nicolas Popovicz Portfolio
   ============================================================ */

/* ── STATE ─────────────────────────────────────────────────── */
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

/* ── SCROLL (RAF-throttled, single listener) ─────────────────── */
const progress = document.getElementById('progress');
const navEl = document.getElementById('nav');
const navAnchors = document.querySelectorAll('.nav-links a');
const sections = ['skills', 'experience', 'projects', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
const orb1 = document.querySelector('.orb1');
const orb2 = document.querySelector('.orb2');

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      const pct = sy / (document.body.scrollHeight - window.innerHeight) * 100;
      progress.style.width = pct + '%';
      navEl.classList.toggle('scrolled', sy > 40);

      if (!isTouchDevice) {
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
      grid.innerHTML = '<div class="project-loading">Nenhum repositório público encontrado.</div>';
      return;
    }

    grid.innerHTML = filtered.map((repo, i) => {
      const lang = repo.language || 'Other';
      const color = langColors[lang] || '#8895b0';
      const desc = repo.description
        ? repo.description.slice(0, 100) + (repo.description.length > 100 ? '…' : '')
        : 'Sem descrição disponível.';
      const updated = new Date(repo.updated_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      return `
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-card reveal" style="transition-delay:${i * 0.06}s">
          <div class="project-header">
            <div class="project-name">${repo.name}</div>
            <div class="project-arrow">↗</div>
          </div>
          <div class="project-desc">${desc}</div>
          <div class="project-footer">
            <div class="project-lang">
              <div class="lang-dot" style="background:${color}"></div>
              ${lang}
            </div>
            <div class="project-stars">
              ${repo.stargazers_count > 0 ? `⭐ ${repo.stargazers_count}` : updated}
            </div>
          </div>
        </a>`;
    }).join('');

    grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    attachCardTilt();
    attachHoverFXToCards();
  } catch (err) {
    grid.innerHTML = `
      <div class="project-loading" style="grid-column:1/-1">
        <p style="margin-bottom:16px">Não foi possível carregar os repositórios.<br>Veja direto no GitHub:</p>
        <a href="https://github.com/NicolasPopovicz" target="_blank" rel="noopener noreferrer" class="btn-primary" style="display:inline-block">github.com/NicolasPopovicz</a>
      </div>`;
  }
}

loadRepos();

/* ── CUSTOM CURSOR (desktop only) ───────────────────────────── */
if (!isTouchDevice) {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    ring.style.left = mx + 'px'; ring.style.top = my + 'px';
  });

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a,button,.skill-tag,.project-card,.contact-row,.btn-primary,.btn-secondary,.nav-cta'))
      document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a,button,.skill-tag,.project-card,.contact-row,.btn-primary,.btn-secondary,.nav-cta'))
      document.body.classList.remove('cursor-hover');
  });
}

/* ── LOADER ─────────────────────────────────────────────────── */
const loaderLines = document.getElementById('loaderLines');
const loaderProg = document.getElementById('loaderProg');

const bootLines = isTouchDevice
  ? [
      '<span class="d">$</span> <span class="g">npm</span> run <span class="y">build:portfolio</span>',
      '<span class="d">›</span> Compilando <span class="b">26</span> skills, <span class="b">9</span> repos...',
      '<span class="d">›</span> <span class="ok">✓ ready</span>',
    ]
  : [
      '<span class="d">$</span> <span class="g">npm</span> run <span class="y">build:portfolio</span>',
      '<span class="d">›</span> Carregando módulos <span class="p">@nicolas/core</span>...',
      '<span class="d">›</span> Compilando <span class="b">3</span> empresas, <span class="b">26</span> skills, <span class="b">9</span> repos...',
      '<span class="d">›</span> Inicializando <span class="p">canvas</span> + <span class="p">animations</span>...',
      '<span class="d">›</span> <span class="ok">✓ ready</span> em <span class="y">1.2s</span>',
    ];

let bootI = 0;
function bootStep() {
  if (bootI < bootLines.length) {
    const l = document.createElement('div');
    l.className = 'loader-line'; l.innerHTML = bootLines[bootI];
    loaderLines.appendChild(l);
    requestAnimationFrame(() => l.classList.add('show'));
    bootI++;
    setTimeout(bootStep, 280);
  }
}
bootStep();

let lp = 0;
const lpTimer = setInterval(() => {
  lp += Math.random() * 7 + 2;
  if (lp >= 100) { lp = 100; clearInterval(lpTimer); setTimeout(finishLoader, 400); }
  loaderProg.style.width = lp + '%';
}, 80);

function finishLoader() {
  document.getElementById('loader').classList.add('done');
  document.body.style.overflow = '';
  startHeroAnimations();
}
document.body.style.overflow = 'hidden';

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
  const phrases = [
    'Back-end Developer · Pleno @ Stokki',
    'Logística · WMS · DMS · OMS',
    'Node.js · TypeScript · PostgreSQL',
    'Microsserviços · Docker · Redis',
    '4+ anos construindo sistemas críticos',
  ];
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

/* parallax orbs handled inside unified scroll listener above */

/* ── MAGNETIC BUTTONS (desktop only) ────────────────────────── */
if (!isTouchDevice) {
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

/* active nav handled inside unified scroll listener above */

/* ── 3D TILT ON CARDS (desktop only) ────────────────────────── */
function attachCardTilt() {
  if (isTouchDevice) return;
  document.querySelectorAll('.skill-card,.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = 'translateY(-6px) rotateX(' + (-y * 4) + 'deg) rotateY(' + (x * 4) + 'deg)';
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}
attachCardTilt();

/* ── BACK TO TOP ─────────────────────────────────────────────── */
const btt = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  btt.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── HOVER FX (event-delegated, single listener) ─────────────── */
const hoverFXText = ['fx-float', 'fx-shake', 'fx-scale', 'fx-skew', 'fx-color', 'fx-neon', 'fx-glitch', 'fx-bounce', 'fx-flip', 'fx-blur'];
const hoverFXCard = ['fx-glow', 'fx-color', 'fx-scale', 'fx-glitch', 'fx-blur', 'fx-bounce'];
const hoverFXTouch = ['fx-scale', 'fx-glow', 'fx-bounce'];

const FX_TEXT_SEL = 'h2,h3,.section-tag,.skill-cat,.exp-role,.card-label,.exp-company-name,.project-name,.edu-school,.lang-name,.footer-logo';
const FX_CARD_SEL = '.skill-card,.project-card,.info-card,.exp-item,.contact-row,.stat-box';

function triggerHoverFX(el, pool) {
  if (el.dataset.fxActive) return;
  const cls = pool[Math.floor(Math.random() * pool.length)];
  el.dataset.fxActive = '1';
  el.classList.add(cls);
  setTimeout(() => { el.classList.remove(cls); delete el.dataset.fxActive; }, 500);
}

if (!isTouchDevice) {
  document.addEventListener('mouseover', (e) => {
    const textEl = e.target.closest(FX_TEXT_SEL);
    if (textEl) { triggerHoverFX(textEl, hoverFXText); return; }
    const cardEl = e.target.closest(FX_CARD_SEL);
    if (cardEl) triggerHoverFX(cardEl, hoverFXCard);
  }, { passive: true });
} else {
  document.addEventListener('touchstart', (e) => {
    const el = e.target.closest(FX_TEXT_SEL + ',' + FX_CARD_SEL);
    if (el) triggerHoverFX(el, hoverFXTouch);
  }, { passive: true });
}

function attachHoverFXToCards() { /* handled by delegated listener */ }

/* ── AUTO THEME GLITCH ───────────────────────────────────────── */
const themes = {
  purple: {
    '--accent': '#6d5ffa', '--accent2': '#a78bfa', '--bg': '#0b0d14', '--bg2': '#0f1219',
    '--green': '#22d3a8', '--accent-glow': 'rgba(109,95,250,0.18)',
    '--surface': '#141720', '--surface2': '#1a1e2c', '--border': '#1e2438',
  },
  matrix: {
    '--accent': '#00ff41', '--accent2': '#39ff14', '--bg': '#060a06', '--bg2': '#090f09',
    '--green': '#00ff41', '--accent-glow': 'rgba(0,255,65,0.14)',
    '--surface': '#0a140a', '--surface2': '#0d190d', '--border': '#143314',
  },
  cyber: {
    '--accent': '#ff2d78', '--accent2': '#00e5ff', '--bg': '#07000d', '--bg2': '#0a0012',
    '--green': '#00e5ff', '--accent-glow': 'rgba(255,45,120,0.15)',
    '--surface': '#110018', '--surface2': '#16002a', '--border': '#280048',
  },
  amber: {
    '--accent': '#f59e0b', '--accent2': '#fbbf24', '--bg': '#0d0905', '--bg2': '#100c07',
    '--green': '#34d399', '--accent-glow': 'rgba(245,158,11,0.15)',
    '--surface': '#1a1209', '--surface2': '#1f160b', '--border': '#2d1f0e',
  },
};

let currentTheme = 'purple';

function autoThemeGlitch() {
  const keys = Object.keys(themes).filter(k => k !== currentTheme);
  currentTheme = keys[Math.floor(Math.random() * keys.length)];

  document.body.classList.add('theme-glitching');

  setTimeout(() => {
    document.body.classList.add('theme-changing');
    const t = themes[currentTheme];
    Object.entries(t).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));

    setTimeout(() => {
      document.body.classList.remove('theme-changing', 'theme-glitching');
      setTimeout(autoThemeGlitch, 28000 + Math.random() * 22000);
    }, 900);
  }, 150);
}

setTimeout(autoThemeGlitch, 32000 + Math.random() * 10000);

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

  let frame = 0;
  const interval = setInterval(() => {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, 0, overlay.width, overlay.height);
    ctx.fillStyle = currentTheme === 'matrix' ? '#39ff14' : (currentTheme === 'cyber' ? '#00e5ff' : '#00ff41');
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
        el.textContent = original;
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

/* ── EASTER EGG: PARTY MODE (konami reward) ──────────────────── */
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

/* ── EASTER EGG SCHEDULER ────────────────────────────────────── */
const easterEggs = [matrixRain, textScramble, emojiBomb];
function scheduleEasterEgg() {
  setTimeout(() => {
    easterEggs[Math.floor(Math.random() * easterEggs.length)]();
    scheduleEasterEgg();
  }, 95000 + Math.random() * 100000);
}
scheduleEasterEgg();

/* ── KONAMI CODE ─────────────────────────────────────────────── */
let konamiSeq = [];
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
document.addEventListener('keydown', e => {
  konamiSeq.push(e.key);
  if (konamiSeq.length > KONAMI.length) konamiSeq.shift();
  if (konamiSeq.join(',') === KONAMI.join(',')) {
    konamiSeq = [];
    partyMode();
  }
});

/* ── FOOTER YEAR ─────────────────────────────────────────────── */
const fyEl = document.getElementById('footer-year');
if (fyEl) fyEl.textContent = new Date().getFullYear();
