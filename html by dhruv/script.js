/* =========================================
   AI STUDIES — SCRIPT.JS
   Three.js Hero + All Interactivity
   ========================================= */

// ─── THEME TOGGLE ───────────────────────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const html        = document.documentElement;

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀' : '☾';
  localStorage.setItem('aistudies-theme', theme);
}
themeToggle.addEventListener('click', () => {
  setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});
// Restore saved theme
const saved = localStorage.getItem('aistudies-theme');
if (saved) setTheme(saved);

// ─── HAMBURGER ──────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
// Close on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ─── NAVBAR SCROLL ──────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  // Active nav link
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
});

// ─── THREE.JS HERO SCENE ─────────────────────────────────────────────────────
(function initHero() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('heroCanvas');
  const W = canvas.clientWidth  || window.innerWidth;
  const H = canvas.clientHeight || window.innerHeight;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020510, 0.018);

  // Camera
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 600);
  camera.position.set(0, 2, 18);
  camera.lookAt(0, 1, 0);

  // Mouse tracking
  const mouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── LIGHTING ──
  const ambientLight = new THREE.AmbientLight(0x0a0f2e, 2);
  scene.add(ambientLight);

  const blueLight = new THREE.PointLight(0x00c8ff, 8, 40);
  blueLight.position.set(-5, 8, 5);
  blueLight.castShadow = true;
  scene.add(blueLight);

  const redLight = new THREE.PointLight(0xff3366, 6, 30);
  redLight.position.set(6, 4, 3);
  scene.add(redLight);

  const purpleLight = new THREE.PointLight(0x8b5cf6, 5, 35);
  purpleLight.position.set(0, 15, -5);
  scene.add(purpleLight);

  const topLight = new THREE.DirectionalLight(0x6699ff, 1.5);
  topLight.position.set(0, 20, 10);
  topLight.castShadow = true;
  scene.add(topLight);

  // ── CITY FLOOR ──
  const floorGeo = new THREE.PlaneGeometry(200, 200, 40, 40);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x050818,
    roughness: 0.2,
    metalness: 0.9,
    wireframe: false,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -4;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grid overlay
  const gridHelper = new THREE.GridHelper(200, 60, 0x001a33, 0x001a33);
  gridHelper.position.y = -3.99;
  gridHelper.material.opacity = 0.4;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // ── CITY BUILDINGS ──
  function createBuilding(x, z, w, d, h, color) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.7,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.05,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2 - 4, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Windows
    const windowCount = Math.floor(h / 2);
    for (let i = 0; i < windowCount; i++) {
      if (Math.random() > 0.35) {
        const wGeo = new THREE.PlaneGeometry(0.3, 0.3);
        const wMat = new THREE.MeshStandardMaterial({
          color: Math.random() > 0.4 ? 0x00c8ff : 0xffcc44,
          emissive: Math.random() > 0.4 ? 0x00c8ff : 0xffcc44,
          emissiveIntensity: Math.random() * 1.5 + 0.5,
        });
        const win = new THREE.Mesh(wGeo, wMat);
        win.position.set(
          x + (Math.random() - 0.5) * (w - 0.4),
          (i * 1.8) + h / 2 - 4 - h + 1,
          z + d / 2 + 0.01
        );
        scene.add(win);
      }
    }
    return mesh;
  }

  // Background city
  const buildingData = [
    [-18, -20, 4, 4, 22, 0x0a1a2e], [-12, -22, 3, 3, 16, 0x0d1a35],
    [-22, -18, 5, 5, 30, 0x0a1530], [-8, -25, 3, 3, 12, 0x0d1535],
    [14, -20, 4, 4, 24, 0x0a1a2e], [20, -18, 5, 5, 32, 0x0a1530],
    [10, -22, 3, 3, 18, 0x0d1535], [24, -22, 3, 3, 14, 0x0a1a2e],
    [-4, -28, 4, 4, 10, 0x0d1535], [4, -26, 3, 3, 14, 0x0a1530],
    [-30, -15, 6, 6, 40, 0x080f1f], [30, -15, 6, 6, 35, 0x080f1f],
    [-15, -30, 4, 3, 8, 0x0a1535], [15, -28, 3, 4, 10, 0x0a1535],
  ];
  buildingData.forEach(b => createBuilding(...b));

  // ── HERO CHARACTER (stylized human figure) ──
  const heroGroup = new THREE.Group();
  scene.add(heroGroup);
  heroGroup.position.set(3, -4, 0);

  // Torso
  const torsoMat = new THREE.MeshStandardMaterial({ color: 0x0d2a5e, roughness: 0.3, metalness: 0.8, emissive: 0x001540, emissiveIntensity: 0.3 });
  const torsoGeo = new THREE.CylinderGeometry(0.6, 0.5, 2.2, 8);
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 3.6;
  torso.castShadow = true;
  heroGroup.add(torso);

  // Chest armor
  const chestMat = new THREE.MeshStandardMaterial({ color: 0xff0033, roughness: 0.2, metalness: 0.9, emissive: 0xff0011, emissiveIntensity: 0.4 });
  const chestGeo = new THREE.BoxGeometry(0.9, 1.5, 0.35);
  const chest = new THREE.Mesh(chestGeo, chestMat);
  chest.position.y = 3.8;
  chest.position.z = 0.3;
  heroGroup.add(chest);

  // Core glow
  const coreGeo = new THREE.SphereGeometry(0.2, 8, 8);
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x00c8ff, emissive: 0x00c8ff, emissiveIntensity: 3 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0, 3.9, 0.5);
  heroGroup.add(core);

  // Head
  const headMat = new THREE.MeshStandardMaterial({ color: 0x0d2a5e, roughness: 0.2, metalness: 0.9, emissive: 0x001540, emissiveIntensity: 0.2 });
  const headGeo = new THREE.SphereGeometry(0.55, 12, 12);
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 5.5;
  head.castShadow = true;
  heroGroup.add(head);

  // Visor
  const visorGeo = new THREE.BoxGeometry(0.9, 0.22, 0.25);
  const visorMat = new THREE.MeshStandardMaterial({ color: 0xff1a4a, roughness: 0.1, metalness: 1, emissive: 0xff0033, emissiveIntensity: 1.5 });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 5.5, 0.5);
  heroGroup.add(visor);

  // Shoulders
  const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x1a3a7e, roughness: 0.25, metalness: 0.9 });
  [-1, 1].forEach(side => {
    const sGeo = new THREE.SphereGeometry(0.38, 8, 8);
    const shoulder = new THREE.Mesh(sGeo, shoulderMat);
    shoulder.position.set(side * 0.95, 4.55, 0);
    heroGroup.add(shoulder);
  });

  // Arms
  const armMat = new THREE.MeshStandardMaterial({ color: 0x0d2a5e, roughness: 0.3, metalness: 0.8 });
  [{ x: -1.1, ry: 0.15 }, { x: 1.1, ry: -0.15 }].forEach((arm, i) => {
    const aGeo = new THREE.CylinderGeometry(0.22, 0.18, 1.8, 8);
    const aMesh = new THREE.Mesh(aGeo, armMat);
    aMesh.position.set(arm.x, 3.5, 0.1);
    aMesh.rotation.z = arm.ry * 1.5;
    heroGroup.add(aMesh);
  });

  // Gauntlets
  const gauntletMat = new THREE.MeshStandardMaterial({ color: 0xff0033, roughness: 0.2, metalness: 0.95, emissive: 0xff0011, emissiveIntensity: 0.3 });
  [-1.3, 1.3].forEach(side => {
    const gGeo = new THREE.BoxGeometry(0.38, 0.45, 0.38);
    const g = new THREE.Mesh(gGeo, gauntletMat);
    g.position.set(side, 2.7, 0);
    heroGroup.add(g);
  });

  // Legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x0d2a5e, roughness: 0.3, metalness: 0.8 });
  [-0.3, 0.3].forEach(side => {
    const lGeo = new THREE.CylinderGeometry(0.28, 0.22, 2.2, 8);
    const leg = new THREE.Mesh(lGeo, legMat);
    leg.position.set(side, 1.3, 0);
    heroGroup.add(leg);
  });

  // Boots
  const bootMat = new THREE.MeshStandardMaterial({ color: 0x1a3a7e, roughness: 0.2, metalness: 0.95 });
  [-0.3, 0.3].forEach(side => {
    const bGeo = new THREE.BoxGeometry(0.45, 0.55, 0.6);
    const boot = new THREE.Mesh(bGeo, bootMat);
    boot.position.set(side, 0.1, 0.1);
    heroGroup.add(boot);
  });

  // Cape effect
  const capeGeo = new THREE.PlaneGeometry(2, 3, 4, 8);
  const capeVerts = capeGeo.attributes.position;
  for (let i = 0; i < capeVerts.count; i++) {
    const x = capeVerts.getX(i);
    const y = capeVerts.getY(i);
    capeVerts.setZ(i, -Math.abs(x) * 0.3 - (y + 1.5) * 0.1);
  }
  const capeMat = new THREE.MeshStandardMaterial({
    color: 0x1a0050,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide,
    emissive: 0x0d0030,
    emissiveIntensity: 0.2,
  });
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 3, -0.5);
  heroGroup.add(cape);

  // Energy lines on suit
  const lineMat = new THREE.MeshStandardMaterial({ color: 0x00c8ff, emissive: 0x00c8ff, emissiveIntensity: 2 });
  [[0, 3.9, 0.4], [0, 3.2, 0.4], [0.4, 3.6, 0.3], [-0.4, 3.6, 0.3]].forEach(pos => {
    const lGeo = new THREE.BoxGeometry(0.04, 0.6, 0.04);
    const l = new THREE.Mesh(lGeo, lineMat);
    l.position.set(...pos);
    heroGroup.add(l);
  });

  // ── SKYSCRAPER PLATFORM ──
  const platformGeo = new THREE.BoxGeometry(8, 1.5, 8);
  const platformMat = new THREE.MeshStandardMaterial({ color: 0x080e22, roughness: 0.15, metalness: 0.95 });
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.set(3, -4.75, 0);
  platform.receiveShadow = true;
  scene.add(platform);

  // Platform edge glow
  for (let i = 0; i < 4; i++) {
    const edgeGeo = new THREE.BoxGeometry(i % 2 === 0 ? 8.1 : 0.1, 0.1, i % 2 === 0 ? 0.1 : 8.1);
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x00c8ff, emissive: 0x00c8ff, emissiveIntensity: 3 });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    const positions = [[0, -4, 4], [0, -4, -4], [4, -4, 0], [-4, -4, 0]];
    edge.position.set(3 + positions[i][0], positions[i][1], positions[i][2]);
    scene.add(edge);
  }

  // ── PARTICLES ──
  const particleCount = 1500;
  const positions = new Float32Array(particleCount * 3);
  const colors    = new Float32Array(particleCount * 3);
  const sizes     = new Float32Array(particleCount);

  const pColors = [
    new THREE.Color(0x00c8ff),
    new THREE.Color(0x8b5cf6),
    new THREE.Color(0x00ffd4),
    new THREE.Color(0xff3366),
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 20;
    const c = pColors[Math.floor(Math.random() * pColors.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    sizes[i] = Math.random() * 1.5 + 0.5;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const pMat = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ── FLOATING HOLOGRAPHIC RINGS ──
  const rings = [];
  const ringPositions = [
    { x: -3, y: 3, z: -2 },
    { x:  5, y: 6, z: -4 },
    { x:  8, y: 2, z: -3 },
  ];
  ringPositions.forEach((pos, i) => {
    const rGeo = new THREE.TorusGeometry(1 + i * 0.4, 0.04, 8, 64);
    const rMat = new THREE.MeshStandardMaterial({
      color: [0x00c8ff, 0x8b5cf6, 0x00ffd4][i],
      emissive: [0x00c8ff, 0x8b5cf6, 0x00ffd4][i],
      emissiveIntensity: 2,
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.set(pos.x, pos.y, pos.z);
    ring.rotation.x = Math.PI / 3 * (i + 1);
    scene.add(ring);
    rings.push(ring);
  });

  // ── DATA STREAMS (vertical lines) ──
  for (let i = 0; i < 20; i++) {
    const streamGeo = new THREE.BufferGeometry();
    const streamY = (Math.random() - 0.5) * 40;
    const streamX = (Math.random() - 0.5) * 60;
    const streamZ = -(Math.random() * 40 + 5);
    const pts = [
      new THREE.Vector3(streamX, streamY, streamZ),
      new THREE.Vector3(streamX, streamY - Math.random() * 5 - 2, streamZ),
    ];
    streamGeo.setFromPoints(pts);
    const streamMat = new THREE.LineBasicMaterial({
      color: Math.random() > 0.5 ? 0x00c8ff : 0x8b5cf6,
      transparent: true,
      opacity: Math.random() * 0.6 + 0.2,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Line(streamGeo, streamMat));
  }

  // ── GLOWING ORBS ──
  const orbs = [];
  for (let i = 0; i < 8; i++) {
    const orbGeo = new THREE.SphereGeometry(0.15 + Math.random() * 0.2, 8, 8);
    const orbColor = [0x00c8ff, 0x8b5cf6, 0xff3366, 0x00ffd4][Math.floor(Math.random() * 4)];
    const orbMat = new THREE.MeshStandardMaterial({ color: orbColor, emissive: orbColor, emissiveIntensity: 4 });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 8,
      (Math.random() - 0.5) * 10 - 3
    );
    orb.userData = {
      baseY: orb.position.y,
      speed: Math.random() * 0.5 + 0.3,
      offset: Math.random() * Math.PI * 2,
    };
    scene.add(orb);
    orbs.push(orb);
  }

  // ── RESIZE HANDLER ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── ANIMATION LOOP ──
  let t = 0;
  const targetCamX = { val: 0 };
  const targetCamY = { val: 0 };
  let currentCamX = 0;
  let currentCamY = 0;

  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;

    // Camera mouse follow (smooth)
    currentCamX += (mouse.x * 1.5 - currentCamX) * 0.04;
    currentCamY += (mouse.y * 0.5 - currentCamY) * 0.04;
    camera.position.x = currentCamX;
    camera.position.y = 2 + currentCamY;
    camera.lookAt(0, 1, 0);

    // Hero idle animation
    heroGroup.rotation.y = Math.sin(t * 0.4) * 0.15;
    heroGroup.position.y = -4 + Math.sin(t * 0.6) * 0.12;

    // Cape wave
    cape.rotation.z = Math.sin(t * 1.2) * 0.08;

    // Core pulse
    core.material.emissiveIntensity = 2.5 + Math.sin(t * 3) * 1.5;
    visor.material.emissiveIntensity = 1.2 + Math.sin(t * 4) * 0.8;

    // Rotate rings
    rings.forEach((ring, i) => {
      ring.rotation.x += 0.008 * (i + 1);
      ring.rotation.z += 0.005 * (i + 1);
      ring.position.y += Math.sin(t + i) * 0.003;
    });

    // Float orbs
    orbs.forEach(orb => {
      orb.position.y = orb.userData.baseY + Math.sin(t * orb.userData.speed + orb.userData.offset) * 1.2;
      orb.material.emissiveIntensity = 3 + Math.sin(t * 2 + orb.userData.offset) * 1.5;
    });

    // Animate particles
    particles.rotation.y = t * 0.02;
    const posArr = pGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      posArr[i * 3 + 1] += 0.008;
      if (posArr[i * 3 + 1] > 30) posArr[i * 3 + 1] = -30;
    }
    pGeo.attributes.position.needsUpdate = true;

    // Animate lights
    blueLight.position.x = Math.sin(t * 0.5) * 8 - 5;
    blueLight.position.z = Math.cos(t * 0.5) * 5 + 5;
    redLight.position.x  = Math.cos(t * 0.7) * 6 + 3;

    renderer.render(scene, camera);
  }
  animate();
})();

// ─── COUNTER ANIMATION ───────────────────────────────────────────────────────
function animateCounter(el, target, duration = 2000) {
  const start = performance.now();
  const update = now => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const countersStarted = { started: false };
function tryStartCounters() {
  if (countersStarted.started) return;
  const hero = document.querySelector('.hero-stats');
  if (!hero) return;
  const rect = hero.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    countersStarted.started = true;
    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
      animateCounter(el, parseInt(el.dataset.target));
    });
  }
}
window.addEventListener('scroll', tryStartCounters);
setTimeout(tryStartCounters, 500);

// ─── SCROLL REVEAL ──────────────────────────────────────────────────────────
function addReveal() {
  const targets = [
    '.course-card', '.resource-card', '.blog-card',
    '.testimonial-card', '.faq-item', '.ci-item',
    '.dash-stat-card', '.progress-item',
    '.about-values .value-item', '.rc-icon',
  ];
  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 0.07) + 's';
    });
  });
}
addReveal();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── COURSES FILTER ──────────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const filter = this.dataset.filter;
    document.querySelectorAll('.course-card').forEach(card => {
      const show = filter === 'all' || card.dataset.level === filter;
      card.style.opacity    = show ? '1' : '0.2';
      card.style.transform  = show ? '' : 'scale(0.96)';
      card.style.pointerEvents = show ? '' : 'none';
    });
  });
});

// ─── FAQ ACCORDION ───────────────────────────────────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', function() {
    const item   = this.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ─── NEWSLETTER FORM ─────────────────────────────────────────────────────────
document.getElementById('nlSubmit').addEventListener('click', function() {
  const input   = document.getElementById('nlEmail');
  const success = document.getElementById('nlSuccess');
  if (input.value && input.value.includes('@')) {
    document.getElementById('nlForm').style.display = 'none';
    success.style.display = 'block';
  } else {
    input.style.borderColor = '#ff3366';
    setTimeout(() => input.style.borderColor = '', 1500);
  }
});

// ─── CONTACT FORM ────────────────────────────────────────────────────────────
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const success = document.getElementById('formSuccess');
  success.style.display = 'block';
  this.querySelectorAll('.form-input').forEach(i => { i.value = ''; });
  setTimeout(() => success.style.display = 'none', 5000);
});

// ─── TESTIMONIALS AUTO-DUPLICATE (for seamless loop) ─────────────────────────
(function setupTestimonialLoop() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;
  const items = track.innerHTML;
  track.innerHTML = items + items; // duplicate for infinite scroll
})();

// ─── DASHBOARD PROGRESS BARS ANIMATE ON SCROLL ───────────────────────────────
const progressObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.pi-fill').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => { bar.style.width = width; }, 100);
      });
      progressObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const dashMain = document.querySelector('.dash-courses-progress');
if (dashMain) progressObserver.observe(dashMain);

// ─── SMOOTH SCROLL FOR ANCHORS ───────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

console.log('%c⬡ AI Studies %cInitialized', 'color:#00c8ff;font-family:monospace;font-weight:900;font-size:16px;', 'color:#8b5cf6;font-family:monospace;font-size:16px;');