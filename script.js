// ---------- hard refresh always lands on home ----------
(function () {
  try {
    const navEntries = performance.getEntriesByType('navigation');
    const isReload = navEntries.length
      ? navEntries[0].type === 'reload'
      : (performance.navigation && performance.navigation.type === 1);
    if (isReload) {
      window.addEventListener('load', () => window.scrollTo(0, 0));
    }
  } catch (e) {}
})();

// ---------- mobile nav ----------
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ---------- scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ---------- animated stat counters ----------
const statEls = document.querySelectorAll('.stat-num');

function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    el.textContent = prefix + value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statEls.forEach(el => statObserver.observe(el));

// ---------- footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- nav stays transparent (no scroll-based styling) ----------

// ---------- cursor spotlight glow (hero) ----------
const hero = document.getElementById('home');
const spotlight = document.getElementById('spotlight');

if (hero && spotlight && window.matchMedia('(hover: hover)').matches) {
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlight.style.setProperty('--sx', x + 'px');
    spotlight.style.setProperty('--sy', y + 'px');
    spotlight.classList.add('active');
  });
  hero.addEventListener('mouseleave', () => spotlight.classList.remove('active'));
}

// ---------- tilt-on-hover cards (projects, skills, certifications) ----------
function applyTilt(selector, { lift = 8, maxX = 10, maxY = 12 } = {}) {
  const cards = document.querySelectorAll(selector);
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateX = (-py * maxX).toFixed(2);
      const rotateY = (px * maxY).toFixed(2);
      card.style.transform = `translateY(-${lift}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
    });
  });
}

if (window.matchMedia('(hover: hover)').matches) {
  applyTilt('.project-card', { lift: 8, maxX: 10, maxY: 12 });
  applyTilt('.skill-card', { lift: 6, maxX: 8, maxY: 10 });
  applyTilt('.cert-card', { lift: 6, maxX: 8, maxY: 10 });
}

// ---------- magnetic buttons ----------
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ---------- scramble-decode text ----------
function scrambleReveal(el, duration = 900) {
  if (!el) return;
  const final = el.textContent;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const len = final.length;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    let out = '';
    for (let i = 0; i < len; i++) {
      if (final[i] === ' ') { out += ' '; continue; }
      const revealPoint = (i / len) * 0.7;
      out += progress > revealPoint ? final[i] : chars[Math.floor(Math.random() * chars.length)];
    }
    el.textContent = out;
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = final;
  }
  requestAnimationFrame(frame);
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  setTimeout(() => scrambleReveal(document.getElementById('scramble-word')), 700);
}

// ---------- 3D data-network canvas (hero) ----------
(function heroNetwork() {
  const canvas = document.getElementById('hero-3d');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const heroEl = document.getElementById('home');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = window.innerWidth < 768;

  let w, h, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const COUNT = isSmall ? 34 : 64;
  const RADIUS = isSmall ? 170 : 250;
  const LINK_DIST = isSmall ? 70 : 95;
  const points = [];
  for (let i = 0; i < COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = RADIUS * Math.cbrt(Math.random());
    points.push({
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
    });
  }

  let autoRotate = 0;
  let mouseX = 0.5, mouseY = 0.5;
  let smoothX = 0, smoothY = 0;

  if (heroEl && window.matchMedia('(hover: hover)').matches) {
    heroEl.addEventListener('mousemove', (e) => {
      const rect = heroEl.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    });
  }

  function project(p, rotY, rotX, cx, cy, focal) {
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const x1 = p.x * cosY - p.z * sinY;
    const z1 = p.x * sinY + p.z * cosY;
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const y1 = p.y * cosX - z1 * sinX;
    const z2 = p.y * sinX + z1 * cosX;
    const scale = focal / (focal + z2);
    return { sx: cx + x1 * scale, sy: cy + y1 * scale, scale };
  }

  function draw() {
    autoRotate += 0.0016;
    smoothX += ((mouseX - 0.5) - smoothX) * 0.03;
    smoothY += ((mouseY - 0.5) - smoothY) * 0.03;
    const rotY = autoRotate + smoothX * 0.9;
    const rotX = 0.32 + smoothY * 0.45;

    ctx.clearRect(0, 0, w, h);
    const cx = w * (isSmall ? 0.5 : 0.7);
    const cy = h * 0.42;
    const focal = 420;

    const proj = points.map(p => project(p, rotY, rotX, cx, cy, focal));

    for (let i = 0; i < proj.length; i++) {
      for (let j = i + 1; j < proj.length; j++) {
        const dx = proj[i].sx - proj[j].sx;
        const dy = proj[i].sy - proj[j].sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const opacity = (1 - dist / LINK_DIST) * 0.32 * Math.min(proj[i].scale, proj[j].scale);
          ctx.strokeStyle = `rgba(232,35,47,${opacity})`;
          ctx.beginPath();
          ctx.moveTo(proj[i].sx, proj[i].sy);
          ctx.lineTo(proj[j].sx, proj[j].sy);
          ctx.stroke();
        }
      }
    }

    proj.forEach(p => {
      const size = Math.max(1, 2.4 * p.scale);
      const opacity = Math.min(1, p.scale * 0.95);
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,107,115,${opacity})`;
      ctx.fill();
    });

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  draw();
  requestAnimationFrame(() => canvas.classList.add('ready'));
})();

// ---------- scroll-spy nav highlighting ----------
(function navSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('#nav-links a');
  if (!sections.length || !navAnchors.length) return;

  const setActive = (id) => {
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
    });
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => spyObserver.observe(sec));
})();
