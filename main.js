import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ─── Scene & Renderer ─────────────────────────────────────────────────────────
const scene = new THREE.Scene();
// Breathtaking cinematic dusk twilight sky gradient matching the reference photo
function makeDuskSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Multi-stop dusk twilight gradient from deep zenith navy/cyan to warm glowing sunset horizon
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0.00, '#061324'); // deep midnight navy
  grad.addColorStop(0.24, '#0c2642'); // deep twilight azure
  grad.addColorStop(0.48, '#18446c'); // cerulean evening blue
  grad.addColorStop(0.64, '#304a6b'); // dusk indigo
  grad.addColorStop(0.74, '#6a4658'); // twilight mauve
  grad.addColorStop(0.81, '#b64e3c'); // sunset coral
  grad.addColorStop(0.86, '#d96c4b'); // vibrant apricot
  grad.addColorStop(0.92, '#f59a6c'); // warm peach
  grad.addColorStop(0.97, '#ffd094'); // golden horizon light
  grad.addColorStop(1.00, '#101b28'); // horizon haze blending into water/ground
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Wispy horizontal sunset clouds matching the long-exposure clouds in reference photo
  for (let i = 0; i < 30; i++) {
    const y = 620 + (i / 30) * 310 + (Math.sin(i * 3.7) * 20);
    const h = 7 + (i % 4) * 6;
    const cloudGrad = ctx.createLinearGradient(0, y, 0, y + h);
    const alpha = 0.05 + Math.sin((i / 30) * Math.PI) * 0.15;
    if (y < 760) {
      cloudGrad.addColorStop(0, 'rgba(40, 75, 115, 0)');
      cloudGrad.addColorStop(0.5, `rgba(180, 95, 85, ${alpha})`);
      cloudGrad.addColorStop(1, 'rgba(40, 75, 115, 0)');
    } else {
      cloudGrad.addColorStop(0, 'rgba(220, 110, 70, 0)');
      cloudGrad.addColorStop(0.5, `rgba(255, 175, 120, ${alpha * 1.25})`);
      cloudGrad.addColorStop(1, 'rgba(220, 110, 70, 0)');
    }
    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.moveTo(0, y + h * 0.5);
    for (let x = 0; x <= 1024; x += 128) {
      const cy = y + Math.sin(x * 0.012 + i * 1.1) * h * 0.55;
      ctx.lineTo(x, cy);
    }
    ctx.lineTo(1024, y + h);
    ctx.lineTo(0, y + h);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const duskSkyTexture = makeDuskSkyTexture();
scene.background = duskSkyTexture;
// Atmospheric horizon fog tuned to blend smoothly into the sunset haze
scene.fog = new THREE.FogExp2(0x132034, 0.0034);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(4.4, 2.65, 7.65);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
pmremGenerator.dispose();

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.9, 1.55);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.autoRotate = false;
controls.minDistance = 4.2;
controls.maxDistance = 18;
controls.maxPolarAngle = Math.PI * 0.485;

// ─── Lighting ─────────────────────────────────────────────────────────────────
scene.add(new THREE.HemisphereLight(0x2a4a72, 0x0d1830, 1.6));

const keyLight = new THREE.DirectionalLight(0xffd5a4, 2.65);
keyLight.position.set(4, 8, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -7;
keyLight.shadow.camera.right = 7;
keyLight.shadow.camera.top = 7;
keyLight.shadow.camera.bottom = -7;
keyLight.shadow.bias = -0.00015;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x3a5a8a, 0.9);
fillLight.position.set(-5, 4, -4);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xb0ccff, 1.4);
rimLight.position.set(-2, 5, 6);
scene.add(rimLight);

// Cool directional moonlight aligned with moon position
const moonLight = new THREE.DirectionalLight(0x9fc4ea, 0.75);
moonLight.position.set(38, 58, -25);
scene.add(moonLight);

// ─── Universal Modeling Helpers ───────────────────────────────────────────────
function box(parent, size, position, material, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  if (options.rotation) mesh.rotation.set(...options.rotation);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, rTop, rBot, height, segments, pos, rot, mat, options = {}) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, height, segments), mat);
  mesh.position.set(...pos);
  if (rot) mesh.rotation.set(...rot);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  parent.add(mesh);
  return mesh;
}

function sphere(parent, scale, position, material) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), material);
  mesh.scale.set(...scale);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function torus(parent, r, tube, radSeg, tubSeg, pos, rot, mat) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, tube, radSeg, tubSeg), mat);
  mesh.position.set(...pos);
  if (rot) mesh.rotation.set(...rot);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function beamBetween(parent, start, end, radius, material, sides = 12) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = to.clone().sub(from);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), sides), material);
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function addSideShape(parent, points, z, material, name) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (const point of points.slice(1)) shape.lineTo(point[0], point[1]);
  shape.closePath();
  const mat = material.clone();
  mat.side = THREE.DoubleSide;
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
  mesh.position.z = z;
  mesh.name = name;
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function addQuad(parent, points, material, name) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  const mat = material.clone();
  mat.side = THREE.DoubleSide;
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.name = name;
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function smoothSample(sections, t) {
  const position = THREE.MathUtils.clamp(t, 0, 0.999999) * (sections.length - 1);
  const index = Math.floor(position);
  const amount = position - index;
  const a = sections[Math.max(0, index - 1)];
  const b = sections[index];
  const c = sections[Math.min(sections.length - 1, index + 1)];
  const d = sections[Math.min(sections.length - 1, index + 2)];
  return b.map((value, field) => {
    const p0 = a[field];
    const p1 = b[field];
    const p2 = c[field];
    const p3 = d[field];
    return 0.5 * (
      2 * p1 + (-p0 + p2) * amount +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * amount ** 2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * amount ** 3
    );
  });
}

function loftProfile(parent, sections, material, name, longitudinalSteps = 72) {
  const positions = [];
  const indices = [];
  const profileSteps = 32;

  function crossSection(section) {
    const [, topY, shoulderY, bottomY, shoulderWidth, roofWidth] = section;
    const right = [
      [0, topY],
      [roofWidth * 0.48, topY],
      [roofWidth * 0.84, topY - 0.025],
      [roofWidth, topY - 0.11],
      [shoulderWidth * 0.99, shoulderY + 0.12],
      [shoulderWidth, shoulderY],
      [shoulderWidth * 0.94, bottomY + 0.15],
      [shoulderWidth * 0.77, bottomY + 0.035],
      [0, bottomY],
    ];
    const outline = [...right, ...right.slice(1, -1).reverse().map(([z, y]) => [-z, y])];
    const curve = new THREE.CatmullRomCurve3(
      outline.map(([z, y]) => new THREE.Vector3(z, y, 0)),
      true,
      'centripetal',
    );
    return curve.getPoints(profileSteps).slice(0, -1).map((point) => [point.x, point.y]);
  }

  for (let i = 0; i <= longitudinalSteps; i += 1) {
    const section = smoothSample(sections, i / longitudinalSteps);
    const ring = crossSection(section);
    for (let j = 0; j < profileSteps; j += 1) {
      const [z, y] = ring[j];
      positions.push(section[0], y, z);
    }
  }

  for (let i = 0; i < longitudinalSteps; i += 1) {
    for (let j = 0; j < profileSteps; j += 1) {
      const nextJ = (j + 1) % profileSteps;
      const a = i * profileSteps + j;
      const b = (i + 1) * profileSteps + j;
      const c = (i + 1) * profileSteps + nextJ;
      const d = i * profileSteps + nextJ;
      indices.push(a, b, d, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// ─── Ground, Road & City Sidewalks ───────────────────────────────────────────
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(1400, 360),
  new THREE.MeshStandardMaterial({ color: 0x0e1218, roughness: 0.92, metalness: 0.02 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -0.16, -20);
floor.receiveShadow = true;
scene.add(floor);

function makeAsphaltTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const context = canvas.getContext('2d');
  context.fillStyle = '#1a1f24';
  context.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i += 1) {
    const brightness = 28 + Math.random() * 32;
    const alpha = 0.04 + Math.random() * 0.14;
    context.fillStyle = `rgba(${brightness}, ${brightness + 3}, ${brightness + 6}, ${alpha})`;
    context.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2.5, 1);
  }
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * 512;
    const grad = context.createLinearGradient(x, 0, x + 8, 512);
    grad.addColorStop(0, 'rgba(80,100,130,0)');
    grad.addColorStop(0.5, `rgba(80,100,130,${0.03 + Math.random() * 0.05})`);
    grad.addColorStop(1, 'rgba(80,100,130,0)');
    context.fillStyle = grad;
    context.fillRect(x, 0, 6 + Math.random() * 10, 512);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(160, 5);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const asphaltTexture = makeAsphaltTexture();
const asphalt = new THREE.Mesh(
  new THREE.PlaneGeometry(720, 14),
  new THREE.MeshStandardMaterial({ map: asphaltTexture, color: 0xc8ccce, roughness: 0.92, metalness: 0.04 }),
);
asphalt.rotation.x = -Math.PI / 2;
asphalt.position.y = 0;
asphalt.receiveShadow = true;
scene.add(asphalt);

const wetMirror = new THREE.Mesh(
  new THREE.PlaneGeometry(720, 14),
  new THREE.MeshPhysicalMaterial({
    color: 0x445566,
    roughness: 0.08,
    metalness: 0.6,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  }),
);
wetMirror.rotation.x = -Math.PI / 2;
wetMirror.position.y = 0.002;
wetMirror.renderOrder = 1;
scene.add(wetMirror);

const roadPaint = new THREE.MeshStandardMaterial({ color: 0xe0e1d6, roughness: 0.5, metalness: 0.05 });
const roadEdgePaint = new THREE.MeshStandardMaterial({ color: 0xd0d1c6, roughness: 0.54, metalness: 0.03 });
const curbMaterial = new THREE.MeshStandardMaterial({ color: 0x636a70, roughness: 0.84, metalness: 0.04 });
const curbLight = new THREE.MeshStandardMaterial({ color: 0x8a9195, roughness: 0.76 });
const roadMarkings = [];

function addRoadBox(size, position, material, castShadow = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

for (const side of [-1, 1]) {
  addRoadBox([720, 0.025, 0.11], [0, 0.006, side * 6.15], roadEdgePaint);
  addRoadBox([720, 0.18, 2.6], [0, -0.045, side * 8.15], curbMaterial);
  addRoadBox([720, 0.08, 0.16], [0, 0.04, side * 6.85], curbLight);
}

for (const side of [-1, 1]) {
  for (let i = 0; i < 48; i += 1) {
    const dash = addRoadBox([3.8, 0.018, 0.105], [-235 + i * 10, 0.009, side * 3.15], roadPaint);
    roadMarkings.push(dash);
  }
}

const centerStripeMaterial = new THREE.MeshStandardMaterial({
  color: 0xd0922a,
  emissive: 0x3a1a02,
  emissiveIntensity: 0.22,
  roughness: 0.56,
});
addRoadBox([720, 0.022, 0.065], [0, 0.006, -0.11], centerStripeMaterial);
addRoadBox([720, 0.022, 0.065], [0, 0.006, 0.11], centerStripeMaterial);

// ─── Waterfront Promenade Railing & Seawall (along z = -9.45) ─────────────────
const seawallMat = new THREE.MeshStandardMaterial({ color: 0x3e4248, roughness: 0.88, metalness: 0.1 });
const ironRailingMat = new THREE.MeshStandardMaterial({ color: 0x161a20, roughness: 0.45, metalness: 0.82 });

// Stone seawall coping along the edge of the sidewalk
addRoadBox([720, 0.44, 0.32], [0, 0.08, -9.45], seawallMat);

// Wrought-iron riverside balustrade railing
const railingGroup = new THREE.Group();
scene.add(railingGroup);

addRoadBox([720, 0.045, 0.045], [0, 0.95, -9.45], ironRailingMat);
addRoadBox([720, 0.035, 0.035], [0, 0.52, -9.45], ironRailingMat);
addRoadBox([720, 0.035, 0.035], [0, 0.18, -9.45], ironRailingMat);

for (let i = 0; i < 220; i++) {
  const x = -350 + i * 3.2;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.05, 8), ironRailingMat);
  post.position.set(x, 0.52, -9.45);
  railingGroup.add(post);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), ironRailingMat);
  finial.position.set(x, 1.05, -9.45);
  railingGroup.add(finial);
}

// ─── Shared Automotive Materials ─────────────────────────────────────────────
const rubberMat = new THREE.MeshStandardMaterial({ color: 0x111315, roughness: 0.82, metalness: 0.05 });
const brakeDiscMat = new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.35, metalness: 0.85 });
const redCaliperMat = new THREE.MeshStandardMaterial({ color: 0xd61f1f, roughness: 0.35, metalness: 0.4 });
const darkTrimMat = new THREE.MeshStandardMaterial({ color: 0x14181c, roughness: 0.5, metalness: 0.4 });
const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdee4ea, roughness: 0.12, metalness: 0.95 });
const solidGlassMat = new THREE.MeshStandardMaterial({ color: 0x0a121a, roughness: 0.22, metalness: 0.6 });

function makeStandardWheel(parent, x, side, radius, width, type) {
  const pivot = new THREE.Group();
  pivot.position.set(x, radius, side * 0.86);
  parent.add(pivot);

  const spin = new THREE.Group();
  pivot.add(spin);

  cylinder(spin, radius, radius, width, 32, [0, 0, 0], [Math.PI / 2, 0, 0], rubberMat);
  cylinder(spin, radius * 0.72, radius * 0.72, 0.035, 32, [0, 0, side * (width * 0.3)], [Math.PI / 2, 0, 0], brakeDiscMat);
  box(pivot, [radius * 0.42, radius * 0.35, 0.07], [radius * 0.48, radius * 0.14, side * (width * 0.28)], redCaliperMat);

  if (type === 'fsport') {
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x262a30, roughness: 0.28, metalness: 0.88 });
    torus(spin, radius * 0.76, 0.022, 10, 36, [0, 0, side * (width * 0.52)], [0, 0, 0], rimMat);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      box(spin, [0.026, radius * 0.65, 0.022], [Math.sin(a) * radius * 0.33, Math.cos(a) * radius * 0.33, side * (width * 0.53)], rimMat, {
        rotation: [0, 0, -a],
      });
    }
    cylinder(spin, 0.07, 0.07, 0.04, 20, [0, 0, side * (width * 0.55)], [Math.PI / 2, 0, 0], darkTrimMat);
    box(spin, [0.012, 0.05, 0.01], [0, 0, side * (width * 0.575)], chromeMat);
  } else if (type === 'golf8') {
    const faceMat = new THREE.MeshStandardMaterial({ color: 0xd2d8de, roughness: 0.2, metalness: 0.9 });
    const pocketMat = new THREE.MeshStandardMaterial({ color: 0x14181c, roughness: 0.35, metalness: 0.6 });
    torus(spin, radius * 0.76, 0.022, 10, 36, [0, 0, side * (width * 0.52)], [0, 0, 0], faceMat);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      box(spin, [0.038, radius * 0.66, 0.022], [Math.sin(a) * radius * 0.33, Math.cos(a) * radius * 0.33, side * (width * 0.53)], faceMat, {
        rotation: [0, 0, -a],
      });
      box(spin, [0.032, radius * 0.62, 0.018], [Math.sin(a + 0.14) * radius * 0.33, Math.cos(a + 0.14) * radius * 0.33, side * (width * 0.51)], pocketMat, {
        rotation: [0, 0, -a - 0.14],
      });
    }
    cylinder(spin, 0.075, 0.075, 0.04, 20, [0, 0, side * (width * 0.55)], [Math.PI / 2, 0, 0], darkTrimMat);
    torus(spin, 0.04, 0.008, 8, 20, [0, 0, side * (width * 0.575)], [0, 0, 0], chromeMat);
  } else if (type === 'audiAero') {
    const aeroMat = new THREE.MeshStandardMaterial({ color: 0xabb2b8, roughness: 0.18, metalness: 0.92 });
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x15181c, roughness: 0.3, metalness: 0.7 });
    torus(spin, radius * 0.82, 0.024, 10, 36, [0, 0, side * (width * 0.52)], [0, 0, 0], aeroMat);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      box(spin, [0.024, radius * 0.72, 0.02], [Math.sin(a) * radius * 0.38, Math.cos(a) * radius * 0.38, side * (width * 0.53)], aeroMat, {
        rotation: [0, 0, -a + 0.28],
      });
    }
    cylinder(spin, 0.09, 0.09, 0.04, 20, [0, 0, side * (width * 0.55)], [Math.PI / 2, 0, 0], innerMat);
    for (let r = 0; r < 4; r++) {
      torus(spin, 0.02, 0.004, 6, 16, [(r - 1.5) * 0.022, 0, side * (width * 0.575)], [0, 0, 0], chromeMat);
    }
  }

  return { pivot, spin, isFront: x > 0, radius };
}

// ─── CAR BUILDERS ─────────────────────────────────────────────────────────────
function buildVerdeR1() {
  const root = new THREE.Group();
  const wheels = [];

  const bodyPaint = new THREE.MeshPhysicalMaterial({
    color: 0x85a916,
    metalness: 0.42,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.13,
  });
  const brightPaint = new THREE.MeshPhysicalMaterial({
    color: 0xb3cf36,
    metalness: 0.38,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  const carbon = new THREE.MeshStandardMaterial({ color: 0x10151a, metalness: 0.72, roughness: 0.32 });
  const deepCarbon = new THREE.MeshStandardMaterial({ color: 0x080b0e, metalness: 0.48, roughness: 0.38 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x20272b, metalness: 0.78, roughness: 0.24 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xaeb9bd, metalness: 0.88, roughness: 0.2 });
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0xfff7dd,
    emissive: 0xffe7ad,
    emissiveIntensity: 2.2,
    metalness: 0.15,
    roughness: 0.22,
  });
  const redLampMat = new THREE.MeshStandardMaterial({
    color: 0xc92825,
    emissive: 0xbb0808,
    emissiveIntensity: 2.2,
    metalness: 0.25,
    roughness: 0.2,
  });

  const bodySections = [
    [-2.55, 0.72, 0.66, 0.34, 0.48, 0.3],
    [-2.28, 0.96, 0.79, 0.33, 0.69, 0.46],
    [-1.68, 1.1, 0.86, 0.33, 0.82, 0.57],
    [-0.8, 1.18, 0.92, 0.32, 0.89, 0.61],
    [0.15, 1.21, 0.98, 0.32, 0.94, 0.63],
    [0.98, 1.16, 0.96, 0.33, 0.91, 0.58],
    [1.72, 0.98, 0.82, 0.35, 0.78, 0.48],
    [2.28, 0.76, 0.67, 0.37, 0.59, 0.35],
    [2.55, 0.59, 0.54, 0.39, 0.32, 0.2],
  ];
  loftProfile(root, bodySections, bodyPaint, 'Lime Body');

  const canopySections = [
    [-1.28, 1.22, 1.15, 1.08, 0.66, 0.54],
    [-0.96, 1.62, 1.2, 1.09, 0.75, 0.56],
    [-0.42, 1.94, 1.22, 1.09, 0.76, 0.6],
    [0.12, 1.91, 1.22, 1.1, 0.74, 0.59],
    [0.67, 1.47, 1.13, 1.04, 0.68, 0.52],
    [0.86, 1.22, 1.06, 1.01, 0.59, 0.43],
  ];
  loftProfile(root, canopySections, solidGlassMat, 'Lime Canopy', 52);

  addQuad(root, [[0.67, 1.28, -0.66], [0.67, 1.28, 0.66], [0.11, 1.86, 0.55], [0.11, 1.86, -0.55]], solidGlassMat, 'Windshield');
  addQuad(root, [[-1.12, 1.27, -0.62], [-1.12, 1.27, 0.62], [-0.54, 1.85, 0.53], [-0.54, 1.85, -0.53]], solidGlassMat, 'RearWindow');

  const sideWindow = [[-1.08, 1.27], [-0.9, 1.48], [-0.54, 1.75], [-0.28, 1.82], [0.04, 1.79], [0.54, 1.52], [0.67, 1.27]];
  for (const side of [-1, 1]) {
    addSideShape(root, sideWindow, side * 0.748, solidGlassMat, 'SideWindow');
    box(root, [0.055, 0.56, 0.035], [-0.22, 1.54, side * 0.77], darkTrimMat, { rotation: [0, 0, -0.18] });
    box(root, [2.55, 0.13, 0.1], [-0.05, 0.35, side * 0.83], deepCarbon);
    box(root, [0.02, 0.31, 0.04], [0.04, 0.82, side * 0.914], brightPaint);
    beamBetween(root, [0.6, 1.2, side * 0.73], [0.78, 1.3, side * 0.97], 0.035, carbon);
    sphere(root, [0.14, 0.048, 0.095], [0.78, 1.33, side * 0.99], bodyPaint);
  }

  box(root, [0.42, 0.085, 1.72], [2.13, 0.235, 0], deepCarbon);
  box(root, [0.11, 0.25, 1.35], [2.47, 0.47, 0], deepCarbon);
  for (const side of [-1, 1]) {
    sphere(root, [0.027, 0.055, 0.19], [2.16, 0.91, side * 0.59], darkTrimMat);
    box(root, [0.018, 0.014, 0.18], [2.184, 0.944, side * 0.59], ledMat);
    box(root, [0.018, 0.012, 0.12], [2.185, 0.906, side * 0.59], ledMat);
    box(root, [0.1, 0.07, 0.42], [-2.48, 0.78, side * 0.38], redLampMat);
  }
  sphere(root, [0.075, 0.018, 0.048], [2.02, 1.205, 0], silver);
  box(root, [0.38, 0.16, 1.38], [-2.36, 0.31, 0], deepCarbon);
  box(root, [0.5, 0.075, 1.76], [-2.04, 1.42, 0], carbon);

  function makeHypercarWheel(x, side) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.53, side * 0.84);
    root.add(pivot);
    const spin = new THREE.Group();
    pivot.add(spin);
    const isFront = x > 0;
    wheels.push({ pivot, spin, isFront, radius: 0.51 });

    cylinder(spin, 0.51, 0.51, 0.3, 36, [0, 0, 0], [Math.PI / 2, 0, 0], rubberMat);
    cylinder(spin, 0.365, 0.365, 0.035, 32, [0, 0, side * 0.17], [Math.PI / 2, 0, 0], trim);
    torus(spin, 0.39, 0.024, 10, 40, [0, 0, side * 0.195], [0, 0, 0], silver);
    for (let spoke = 0; spoke < 10; spoke += 1) {
      const angle = (spoke / 10) * Math.PI * 2;
      box(spin, [0.033, 0.31, 0.028], [Math.sin(angle) * 0.16, Math.cos(angle) * 0.16, side * 0.205], silver, {
        rotation: [0, 0, -angle],
      });
    }
    cylinder(spin, 0.045, 0.045, 0.075, 20, [0, 0, side * 0.225], [Math.PI / 2, 0, 0], brightPaint);
    box(pivot, [0.1, 0.18, 0.055], [0.27, 0.08, side * 0.16], redCaliperMat);
  }

  makeHypercarWheel(-1.55, -1);
  makeHypercarWheel(-1.55, 1);
  makeHypercarWheel(1.48, -1);
  makeHypercarWheel(1.48, 1);

  return {
    root,
    wheels,
    headlightPos: { x: 2.22, y: 0.92, z: 0.59 },
    taillightPos: { x: -2.55, y: 0.78, z: 0.38 },
  };
}

function buildLexusIS() {
  const root = new THREE.Group();
  const wheels = [];

  const paint = new THREE.MeshPhysicalMaterial({
    color: 0x124eb8,
    metalness: 0.75,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });
  const darkMesh = new THREE.MeshStandardMaterial({ color: 0x121418, metalness: 0.85, roughness: 0.35 });
  const drlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xcde8ff, emissiveIntensity: 3.2 });
  const redBlade = new THREE.MeshStandardMaterial({ color: 0xff2020, emissive: 0xdd0808, emissiveIntensity: 2.8 });

  box(root, [4.6, 0.16, 1.76], [0, 0.28, 0], darkTrimMat);
  box(root, [4.62, 0.44, 1.82], [0, 0.54, 0], paint);

  box(root, [1.52, 0.14, 1.58], [1.32, 0.85, 0], paint, { rotation: [0, 0, -0.06] });
  for (const s of [-1, 1]) {
    box(root, [1.42, 0.04, 0.03], [1.34, 0.91, s * 0.44], paint, { rotation: [0, 0, -0.07] });
    box(root, [1.3, 0.36, 0.2], [1.35, 0.72, s * 0.82], paint);
    box(root, [1.5, 0.42, 0.2], [-1.35, 0.78, s * 0.83], paint);
  }

  box(root, [1.95, 0.08, 1.34], [-0.18, 1.42, 0], paint);
  box(root, [0.18, 0.08, 0.04], [-0.95, 1.49, 0], paint, { rotation: [0, 0, 0.2] });
  box(root, [0.82, 0.06, 1.38], [0.88, 1.18, 0], solidGlassMat, { rotation: [0, 0, -0.62] });
  box(root, [0.86, 0.06, 1.34], [-1.22, 1.18, 0], solidGlassMat, { rotation: [0, 0, 0.58] });

  for (const s of [-1, 1]) {
    box(root, [1.78, 0.38, 0.05], [-0.14, 1.18, s * 0.72], solidGlassMat);
    box(root, [0.08, 0.44, 0.07], [-0.14, 1.18, s * 0.74], darkTrimMat);
    box(root, [1.98, 0.035, 0.04], [-0.18, 1.40, s * 0.73], chromeMat);
    box(root, [0.14, 0.035, 0.035], [0.22, 0.84, s * 0.92], paint);
    box(root, [0.14, 0.035, 0.035], [-0.55, 0.84, s * 0.92], paint);
    box(root, [0.16, 0.09, 0.12], [0.72, 1.02, s * 0.94], paint);
    box(root, [0.12, 0.02, 0.09], [0.74, 1.02, s * 0.96], drlMat);
  }

  box(root, [0.82, 0.24, 1.54], [-1.88, 0.92, 0], paint);
  box(root, [0.14, 0.06, 1.38], [-2.24, 1.06, 0], paint, { rotation: [0, 0, -0.22] });

  cylinder(root, 0.44, 0.34, 0.32, 4, [2.32, 0.72, 0], [0, Math.PI / 4, 0], darkMesh);
  cylinder(root, 0.34, 0.58, 0.42, 4, [2.32, 0.40, 0], [0, Math.PI / 4, 0], darkMesh);
  box(root, [0.03, 0.65, 0.035], [2.34, 0.54, -0.46], chromeMat, { rotation: [0, 0, 0.16] });
  box(root, [0.03, 0.65, 0.035], [2.34, 0.54, 0.46], chromeMat, { rotation: [0, 0, -0.16] });
  box(root, [0.03, 0.035, 0.78], [2.34, 0.86, 0], chromeMat);
  box(root, [0.03, 0.04, 1.05], [2.34, 0.21, 0], chromeMat);

  torus(root, 0.065, 0.012, 8, 24, [2.36, 0.74, 0], [0, 0, 0], chromeMat);
  box(root, [0.015, 0.07, 0.018], [2.365, 0.74, 0.012], chromeMat, { rotation: [0, 0, 0.35] });
  box(root, [0.015, 0.018, 0.06], [2.365, 0.71, 0], chromeMat);

  for (const s of [-1, 1]) {
    box(root, [0.22, 0.42, 0.22], [2.26, 0.46, s * 0.72], darkMesh);
    box(root, [0.02, 0.44, 0.03], [2.29, 0.46, s * 0.82], darkTrimMat);
    box(root, [0.25, 0.04, 0.28], [2.28, 0.20, s * 0.76], darkTrimMat);
  }

  for (const s of [-1, 1]) {
    box(root, [0.18, 0.14, 0.32], [2.25, 0.82, s * 0.68], darkTrimMat);
    for (let p = 0; p < 3; p++) {
      box(root, [0.04, 0.05, 0.06], [2.31, 0.83, s * (0.58 + p * 0.08)], drlMat);
    }
    box(root, [0.025, 0.025, 0.24], [2.33, 0.76, s * 0.68], drlMat);
    box(root, [0.025, 0.11, 0.025], [2.31, 0.81, s * 0.81], drlMat, { rotation: [0, 0, -s * 0.35] });
  }

  box(root, [0.04, 0.035, 1.48], [-2.28, 0.88, 0], redBlade);
  for (const s of [-1, 1]) {
    box(root, [0.12, 0.14, 0.22], [-2.26, 0.86, s * 0.74], redBlade);
    torus(root, 0.055, 0.016, 8, 20, [-2.30, 0.26, s * 0.54], [0, Math.PI / 2, 0], chromeMat);
  }
  torus(root, 0.045, 0.008, 8, 20, [-2.30, 0.85, 0], [0, 0, 0], chromeMat);
  box(root, [0.35, 0.18, 1.42], [-2.20, 0.28, 0], darkTrimMat);

  wheels.push(makeStandardWheel(root,  1.40, -1, 0.44, 0.26, 'fsport'));
  wheels.push(makeStandardWheel(root,  1.40,  1, 0.44, 0.26, 'fsport'));
  wheels.push(makeStandardWheel(root, -1.40, -1, 0.44, 0.26, 'fsport'));
  wheels.push(makeStandardWheel(root, -1.40,  1, 0.44, 0.26, 'fsport'));

  return {
    root,
    wheels,
    headlightPos: { x: 2.26, y: 0.80, z: 0.68 },
    taillightPos: { x: -2.28, y: 0.88, z: 0.74 },
  };
}

function buildGolf8() {
  const root = new THREE.Group();
  const wheels = [];

  const paint = new THREE.MeshPhysicalMaterial({
    color: 0xc4d41e,
    metalness: 0.52,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  const lightBarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe8f4ff, emissiveIntensity: 3.2 });
  const redTailMat = new THREE.MeshStandardMaterial({ color: 0xee1818, emissive: 0xc80808, emissiveIntensity: 2.4 });

  box(root, [4.22, 0.16, 1.74], [0, 0.28, 0], darkTrimMat);
  box(root, [4.24, 0.46, 1.78], [0, 0.56, 0], paint);
  box(root, [1.22, 0.12, 1.54], [1.18, 0.84, 0], paint, { rotation: [0, 0, -0.09] });

  box(root, [2.14, 0.08, 1.34], [-0.12, 1.44, 0], paint);
  box(root, [0.32, 0.06, 1.32], [-1.28, 1.46, 0], paint);
  for (const s of [-1, 1]) {
    box(root, [0.24, 0.14, 0.03], [-1.30, 1.40, s * 0.67], darkTrimMat);
  }

  box(root, [0.84, 0.06, 1.36], [0.82, 1.18, 0], solidGlassMat, { rotation: [0, 0, -0.58] });
  box(root, [0.72, 0.06, 1.30], [-1.32, 1.20, 0], solidGlassMat, { rotation: [0, 0, 0.68] });

  for (const s of [-1, 1]) {
    box(root, [1.54, 0.38, 0.05], [-0.02, 1.20, s * 0.70], solidGlassMat);
    box(root, [0.08, 0.42, 0.06], [0.02, 1.20, s * 0.72], darkTrimMat);
    box(root, [0.42, 0.52, 0.16], [-1.02, 1.18, s * 0.72], paint, { rotation: [0, 0, 0.28] });
    box(root, [3.8, 0.025, 0.03], [0, 0.84, s * 0.89], paint);
    box(root, [0.14, 0.035, 0.03], [0.38, 0.84, s * 0.90], paint);
    box(root, [0.14, 0.035, 0.03], [-0.36, 0.84, s * 0.90], paint);
    box(root, [0.15, 0.09, 0.12], [0.65, 1.02, s * 0.91], paint);
    box(root, [0.12, 0.02, 0.08], [0.67, 1.02, s * 0.93], lightBarMat);
  }

  box(root, [0.04, 0.022, 1.26], [2.11, 0.81, 0], lightBarMat);
  torus(root, 0.068, 0.012, 8, 24, [2.12, 0.80, 0], [0, 0, 0], chromeMat);
  box(root, [0.012, 0.042, 0.012], [2.125, 0.825, -0.016], chromeMat, { rotation: [0, 0, -0.32] });
  box(root, [0.012, 0.042, 0.012], [2.125, 0.825, 0.016], chromeMat, { rotation: [0, 0, 0.32] });
  box(root, [0.012, 0.048, 0.012], [2.125, 0.775, -0.022], chromeMat, { rotation: [0, 0, 0.32] });
  box(root, [0.012, 0.048, 0.012], [2.125, 0.775, 0.022], chromeMat, { rotation: [0, 0, -0.32] });

  for (const s of [-1, 1]) {
    box(root, [0.16, 0.12, 0.28], [2.08, 0.80, s * 0.68], darkTrimMat);
    box(root, [0.03, 0.035, 0.26], [2.11, 0.82, s * 0.68], lightBarMat);
    box(root, [0.03, 0.04, 0.18], [2.10, 0.78, s * 0.66], lightBarMat);
    box(root, [0.22, 0.05, 0.32], [2.08, 0.32, s * 0.74], paint);
  }
  box(root, [0.32, 0.28, 1.34], [2.00, 0.44, 0], darkTrimMat);
  for (let slat = 0; slat < 4; slat++) {
    box(root, [0.03, 0.018, 1.28], [2.12, 0.34 + slat * 0.065, 0], darkTrimMat);
  }
  box(root, [0.02, 0.11, 0.38], [2.14, 0.58, 0], chromeMat);

  box(root, [0.42, 0.42, 1.62], [-1.88, 0.58, 0], paint);
  torus(root, 0.055, 0.010, 8, 24, [-2.11, 0.84, 0], [0, 0, 0], chromeMat);
  for (const s of [-1, 1]) {
    box(root, [0.14, 0.12, 0.22], [-2.06, 0.86, s * 0.72], redTailMat);
    box(root, [0.12, 0.08, 0.18], [-2.08, 0.86, s * 0.54], redTailMat);
    box(root, [0.02, 0.035, 0.16], [-2.11, 0.26, s * 0.56], chromeMat);
  }
  box(root, [0.34, 0.22, 1.68], [-1.96, 0.30, 0], paint);

  wheels.push(makeStandardWheel(root,  1.32, -1, 0.42, 0.25, 'golf8'));
  wheels.push(makeStandardWheel(root,  1.32,  1, 0.42, 0.25, 'golf8'));
  wheels.push(makeStandardWheel(root, -1.33, -1, 0.42, 0.25, 'golf8'));
  wheels.push(makeStandardWheel(root, -1.33,  1, 0.42, 0.25, 'golf8'));

  return {
    root,
    wheels,
    headlightPos: { x: 2.10, y: 0.80, z: 0.66 },
    taillightPos: { x: -2.08, y: 0.86, z: 0.68 },
  };
}

function buildAudiETron() {
  const root = new THREE.Group();
  const wheels = [];

  const paint = new THREE.MeshPhysicalMaterial({
    color: 0xd6dbe2,
    metalness: 0.88,
    roughness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.07,
  });
  const darkMaskMat = new THREE.MeshPhysicalMaterial({
    color: 0x0c0e12,
    metalness: 0.65,
    roughness: 0.16,
    clearcoat: 0.9,
  });
  const grillePanelMat = new THREE.MeshStandardMaterial({
    color: 0xb8c0cb,
    metalness: 0.75,
    roughness: 0.25,
  });
  const illuminatedRingsMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 3.8,
  });
  const redIlluminatedRingsMat = new THREE.MeshStandardMaterial({
    color: 0xff2222,
    emissive: 0xff1111,
    emissiveIntensity: 3.2,
  });
  const matrixLEDMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xdaeeff,
    emissiveIntensity: 3.5,
  });
  const oledTailMat = new THREE.MeshStandardMaterial({
    color: 0xff1616,
    emissive: 0xf50606,
    emissiveIntensity: 3.0,
  });

  box(root, [4.88, 0.15, 1.88], [0, 0.26, 0], darkTrimMat);
  box(root, [4.90, 0.44, 1.94], [0, 0.52, 0], paint);
  box(root, [1.62, 0.12, 1.68], [1.44, 0.82, 0], paint, { rotation: [0, 0, -0.05] });

  box(root, [2.58, 0.08, 1.34], [-0.14, 1.36, 0], solidGlassMat);
  for (const s of [-1, 1]) {
    box(root, [2.75, 0.04, 0.045], [-0.16, 1.36, s * 0.68], chromeMat);
    box(root, [0.18, 0.024, 0.16], [0.82, 1.05, s * 0.94], darkMaskMat);
    box(root, [0.03, 0.02, 0.02], [0.80, 1.05, s * 1.01], matrixLEDMat);
  }
  box(root, [0.92, 0.06, 1.44], [0.98, 1.14, 0], solidGlassMat, { rotation: [0, 0, -0.66] });
  box(root, [1.18, 0.06, 1.36], [-1.34, 1.14, 0], solidGlassMat, { rotation: [0, 0, 0.52] });

  for (const s of [-1, 1]) {
    box(root, [1.88, 0.36, 0.05], [-0.10, 1.15, s * 0.72], solidGlassMat);
    box(root, [2.45, 0.12, 0.08], [0, 0.32, s * 0.94], darkMaskMat);
    box(root, [0.42, 0.03, 0.01], [0, 0.32, s * 0.985], illuminatedRingsMat);
    box(root, [1.25, 0.28, 0.14], [ 1.48, 0.72, s * 0.92], paint);
    box(root, [1.32, 0.32, 0.14], [-1.47, 0.74, s * 0.92], paint);
  }

  box(root, [0.28, 0.64, 1.62], [2.36, 0.58, 0], darkMaskMat);
  box(root, [0.04, 0.44, 1.18], [2.46, 0.62, 0], grillePanelMat);
  for (let slat = -3; slat <= 3; slat++) {
    box(root, [0.02, 0.016, 0.88 - Math.abs(slat) * 0.08], [2.475, 0.62 + slat * 0.045, 0], darkMaskMat);
  }
  for (let r = 0; r < 4; r++) {
    torus(root, 0.044, 0.008, 8, 20, [2.485, 0.78, (r - 1.5) * 0.056], [0, 0, 0], illuminatedRingsMat);
  }

  for (const s of [-1, 1]) {
    box(root, [0.15, 0.038, 0.38], [2.43, 0.82, s * 0.74], matrixLEDMat);
    box(root, [0.22, 0.38, 0.18], [2.38, 0.52, s * 0.84], darkMaskMat);
  }
  box(root, [0.32, 0.05, 1.54], [2.42, 0.22, 0], darkMaskMat);
  box(root, [0.02, 0.03, 0.28], [2.49, 0.22, 0], illuminatedRingsMat);

  box(root, [0.04, 0.04, 1.74], [-2.44, 0.85, 0], oledTailMat);
  for (let r = 0; r < 4; r++) {
    torus(root, 0.038, 0.007, 8, 20, [-2.455, 0.85, (r - 1.5) * 0.050], [0, 0, 0], redIlluminatedRingsMat);
  }
  box(root, [0.22, 0.05, 1.48], [-2.40, 0.91, 0], paint);
  box(root, [0.55, 0.22, 1.62], [-2.28, 0.28, 0], darkMaskMat);
  for (const s of [-1, 1]) {
    box(root, [0.42, 0.18, 0.035], [-2.32, 0.28, s * 0.44], darkMaskMat);
  }

  wheels.push(makeStandardWheel(root,  1.48, -1, 0.46, 0.28, 'audiAero'));
  wheels.push(makeStandardWheel(root,  1.48,  1, 0.46, 0.28, 'audiAero'));
  wheels.push(makeStandardWheel(root, -1.47, -1, 0.46, 0.28, 'audiAero'));
  wheels.push(makeStandardWheel(root, -1.47,  1, 0.46, 0.28, 'audiAero'));

  return {
    root,
    wheels,
    headlightPos: { x: 2.44, y: 0.82, z: 0.74 },
    taillightPos: { x: -2.44, y: 0.85, z: 0.74 },
  };
}

// ─── CAR REGISTRY & ACTIVE STATE ─────────────────────────────────────────────
const CAR_CATALOG = [
  {
    id: 'verde',
    builder: buildVerdeR1,
    monogram: 'V',
    category: 'Advanced design studio',
    title: 'VERDE',
    titleSub: 'R1',
    descEyebrow: 'Form follows velocity',
    descCopy: 'A hand-sculpted hypercar concept in a vivid acid-lime finish.',
  },
  {
    id: 'lexus',
    builder: buildLexusIS,
    monogram: 'L',
    category: 'F SPORT Performance',
    title: 'LEXUS',
    titleSub: 'IS 350',
    descEyebrow: 'Spindle Grille & Sharp LEDs',
    descCopy: 'Grecian Blue sports sedan featuring the hourglass Spindle Grille, L-shaped DRLs, and dark graphite wheels.',
  },
  {
    id: 'golf',
    builder: buildGolf8,
    monogram: 'W',
    category: 'Progressive Compact',
    title: 'VW GOLF',
    titleSub: '08',
    descEyebrow: 'The Iconic Hatchback',
    descCopy: 'Pomelo Yellow metallic hatchback with full-width front LED light bar, chrome VW badge, and signature C-pillar.',
  },
  {
    id: 'audi',
    builder: buildAudiETron,
    monogram: 'A',
    category: 'e-tron Electric Design',
    title: 'AUDI A6',
    titleSub: 'E-TRON',
    descEyebrow: 'Illuminated 4 Rings Concept',
    descCopy: 'Platinum Silver Gran Coupe with illuminated white four rings, Matrix LEDs, virtual mirrors, and continuous OLED rear light strip.',
  },
];

const playerCarData = CAR_CATALOG.map((item) => ({ ...item, ...item.builder() }));

const car = new THREE.Group();
car.position.z = 1.55;
scene.add(car);

let activeCarIndex = 0;
let activeWheels = playerCarData[0].wheels;
car.add(playerCarData[0].root);

function makeHeadlightBeamTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(215, 235, 255, 0.28)');
  g.addColorStop(0.2, 'rgba(195, 225, 255, 0.14)');
  g.addColorStop(0.65, 'rgba(175, 215, 255, 0.04)');
  g.addColorStop(1, 'rgba(160, 200, 255, 0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 256);
  return new THREE.CanvasTexture(c);
}

const beamConeMat = new THREE.MeshBasicMaterial({
  map: makeHeadlightBeamTexture(),
  color: 0xd6e8ff,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
});

const headlightCones = [];
for (const side of [-1, 1]) {
  const coneLength = 18;
  const coneGeo = new THREE.CylinderGeometry(0.08, 1.45, coneLength, 18, 1, true);
  coneGeo.rotateZ(-Math.PI / 2);
  coneGeo.translate(coneLength / 2, 0, 0);
  const cone = new THREE.Mesh(coneGeo, beamConeMat);
  cone.rotation.y = side * 0.02;
  cone.rotation.z = -0.024;
  car.add(cone);
  headlightCones.push({ cone, side });
}

function makeRedTaillightGlowTex() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, 'rgba(255, 55, 45, 0.9)');
  g.addColorStop(0.28, 'rgba(245, 30, 20, 0.45)');
  g.addColorStop(0.65, 'rgba(200, 10, 10, 0.12)');
  g.addColorStop(1, 'rgba(180, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const redGlowMat = new THREE.SpriteMaterial({
  map: makeRedTaillightGlowTex(),
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

function makeHeadlightGlowTex() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, 'rgba(255, 252, 240, 0.95)');
  g.addColorStop(0.28, 'rgba(255, 235, 190, 0.55)');
  g.addColorStop(0.65, 'rgba(220, 205, 160, 0.18)');
  g.addColorStop(1, 'rgba(200, 190, 150, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const trafficHeadlightGlowMat = new THREE.SpriteMaterial({
  map: makeHeadlightGlowTex(),
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const taillightGlows = [];
for (const side of [-1, 1]) {
  const redGlow = new THREE.Sprite(redGlowMat.clone());
  redGlow.scale.set(1.4, 0.55, 1);
  car.add(redGlow);
  taillightGlows.push({ redGlow, side });
}

function updatePlayerCarAccessories() {
  const current = playerCarData[activeCarIndex];
  for (const { cone, side } of headlightCones) {
    cone.position.set(current.headlightPos.x, current.headlightPos.y, side * current.headlightPos.z);
  }
  for (const { redGlow, side } of taillightGlows) {
    redGlow.position.set(current.taillightPos.x, current.taillightPos.y, side * current.taillightPos.z);
  }
}
updatePlayerCarAccessories();

// ─── PROCEDURAL IMPACT SOUND SYNTHESIZER (Web Audio API) ──────────────────────
let audioCtx = null;
function playImpactSound(intensity = 1.0) {
  try {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtx = new AudioCtx();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const clampedIntensity = Math.min(1.5, Math.max(0.3, intensity));

    // 1. Low frequency metallic punch (thud)
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);
    oscGain.gain.setValueAtTime(0.35 * clampedIntensity, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.24);

    // 2. High frequency impact crunch / metal crumple noise
    const bufferSize = Math.floor(audioCtx.sampleRate * 0.09);
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100 + Math.random() * 300;
    filter.Q.value = 2.0;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.28 * clampedIntensity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);
  } catch (err) {
    // Audio autostart policy or unsupported — fail gracefully
  }
}

// ─── IMPACT SPARKS PARTICLE SYSTEM ────────────────────────────────────────────
const MAX_SPARKS = 140;
const sparkPositions = new Float32Array(MAX_SPARKS * 3);
const sparkColors = new Float32Array(MAX_SPARKS * 3);
const sparkVelocities = [];
const sparkLifetimes = new Float32Array(MAX_SPARKS);

for (let i = 0; i < MAX_SPARKS; i++) {
  sparkVelocities.push(new THREE.Vector3(0, 0, 0));
  sparkPositions[i * 3 + 1] = -999; // start hidden
  sparkColors[i * 3]     = 1.0;
  sparkColors[i * 3 + 1] = 0.72;
  sparkColors[i * 3 + 2] = 0.25;
}

const sparkGeometry = new THREE.BufferGeometry();
sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
sparkGeometry.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

function makeSparkTexture() {
  const c = document.createElement('canvas');
  c.width = 32; c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  g.addColorStop(0.25, 'rgba(255, 200, 80, 0.85)');
  g.addColorStop(0.65, 'rgba(255, 100, 20, 0.35)');
  g.addColorStop(1, 'rgba(255, 60, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

const sparkMaterial = new THREE.PointsMaterial({
  map: makeSparkTexture(),
  size: 0.42,
  sizeAttenuation: true,
  vertexColors: true,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const sparkPointsMesh = new THREE.Points(sparkGeometry, sparkMaterial);
sparkPointsMesh.frustumCulled = false;
scene.add(sparkPointsMesh);

let nextSparkIdx = 0;
function triggerSparks(cx, cy, cz, normalX = 0, normalZ = 0, count = 22) {
  for (let k = 0; k < count; k++) {
    const idx = (nextSparkIdx + k) % MAX_SPARKS;
    sparkPositions[idx * 3]     = cx + (Math.random() - 0.5) * 0.2;
    sparkPositions[idx * 3 + 1] = cy + (Math.random() - 0.5) * 0.15;
    sparkPositions[idx * 3 + 2] = cz + (Math.random() - 0.5) * 0.2;

    const speed = 3.5 + Math.random() * 7.5;
    const angle = Math.random() * Math.PI * 2;
    sparkVelocities[idx].set(
      normalX * speed * 0.6 + (Math.random() - 0.5) * 4.0,
      1.5 + Math.random() * 4.0,
      normalZ * speed * 0.6 + (Math.random() - 0.5) * 4.0
    );
    sparkLifetimes[idx] = 0.25 + Math.random() * 0.35;
  }
  nextSparkIdx = (nextSparkIdx + count) % MAX_SPARKS;
}

function updateSparks(delta) {
  const posAttr = sparkGeometry.attributes.position;
  let active = false;
  for (let i = 0; i < MAX_SPARKS; i++) {
    if (sparkLifetimes[i] > 0) {
      active = true;
      sparkLifetimes[i] -= delta;
      const v = sparkVelocities[i];
      v.y -= 14.0 * delta; // gravity
      sparkPositions[i * 3]     += v.x * delta;
      sparkPositions[i * 3 + 1] += v.y * delta;
      sparkPositions[i * 3 + 2] += v.z * delta;

      // Ground bounce
      if (sparkPositions[i * 3 + 1] < 0.02) {
        sparkPositions[i * 3 + 1] = 0.02;
        v.y = -v.y * 0.35;
        v.x *= 0.7;
        v.z *= 0.7;
      }
    } else {
      sparkPositions[i * 3 + 1] = -999;
    }
  }
  if (active) posAttr.needsUpdate = true;
}

// ─── VEHICLE SUSPENSION & COLLISION PHYSICS ENGINE ────────────────────────────
// Camera trauma for visceral screen shake upon impact
let cameraTrauma = 0;

// Player chassis dynamic suspension state
const playerPhysics = {
  roll: 0,
  rollVel: 0,
  pitch: 0,
  pitchVel: 0,
  bounceY: 0,
  bounceVel: 0,
  yawKick: 0,
  yawVel: 0,
  lateralPush: 0,
  cooldown: 0,
};

// ─── MULTI-ROUTE HIGHWAY & METROPOLIS SYSTEM ───────────────────────────────────
const ROUTES = [
  {
    id: 'waterfront',
    name: 'Waterfront Boulevard',
    baseY: 0.0,
    centerZ: 0.0,
    minZ: -4.2,
    maxZ: 4.6,
    camOffsetY: 0.0,
    desc: 'Scenic waterfront boulevard overlooking the East River promenade and Brooklyn Bridge'
  },
  {
    id: 'skyway',
    name: 'Elevated Expressway',
    baseY: 7.8,
    centerZ: 0.0,
    minZ: -4.5,
    maxZ: 4.5,
    camOffsetY: 7.8,
    desc: 'High-speed elevated expressway with concrete jersey barriers and green overhead destination gantries'
  },
  {
    id: 'bridge',
    name: 'Brooklyn Bridge Run',
    baseY: 24.5,
    centerZ: 3.2,
    minZ: 1.8,
    maxZ: 4.6,
    camOffsetY: 24.5,
    desc: 'High-altitude suspension bridge crossing passing directly through the Neo-Gothic lancet arch stone portals'
  },
  {
    id: 'canyon',
    name: 'Metropolis Canyon',
    baseY: 0.0,
    centerZ: 0.0,
    minZ: -4.2,
    maxZ: 4.6,
    camOffsetY: 0.0,
    desc: 'Vibrant skyscraper urban canyon flanked by illuminated cyber skybridges and neon blade signage'
  }
];

let activeRouteIndex = 0;
let routeTransition = 1.0;
let fromRoute = ROUTES[0];
let toRoute = ROUTES[0];
let currentBaseY = 0.0;
let currentCenterZ = 0.0;
let currentPitchSlope = 0.0;

function setActiveRoute(index) {
  if (index < 0 || index >= ROUTES.length || index === activeRouteIndex) return;
  fromRoute = ROUTES[activeRouteIndex];
  toRoute = ROUTES[index];
  activeRouteIndex = index;
  routeTransition = 0.0;

  document.querySelectorAll('.route-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === index);
  });

  const eyebrowEl = document.getElementById('desc-eyebrow');
  const copyEl = document.getElementById('desc-copy');
  if (eyebrowEl && copyEl) {
    eyebrowEl.textContent = toRoute.name;
    copyEl.textContent = toRoute.desc;
  }
}

// ─── AMBIENT ROAD TRAFFIC ─────────────────────────────────────────────────────
const trafficSlots = [
  {
    laneZ: -3.1, dir: -1, relSpeed: 21.0, xOffset: 85,
    currentModel: null, currentRoot: null, wheels: [],
    physics: { roll: 0, rollVel: 0, pitch: 0, pitchVel: 0, bounceY: 0, bounceVel: 0, yawKick: 0, yawVel: 0, lateralPush: 0, cooldown: 0, brakeIntensity: 0, swerveOffset: 0, targetLaneZ: -3.1 }
  },
  {
    laneZ: -1.3, dir: -1, relSpeed: 18.0, xOffset: 45,
    currentModel: null, currentRoot: null, wheels: [],
    physics: { roll: 0, rollVel: 0, pitch: 0, pitchVel: 0, bounceY: 0, bounceVel: 0, yawKick: 0, yawVel: 0, lateralPush: 0, cooldown: 0, brakeIntensity: 0, swerveOffset: 0, targetLaneZ: -1.3 }
  },
  {
    laneZ:  1.3, dir:  1, relSpeed: 14.0, xOffset: 40,
    currentModel: null, currentRoot: null, wheels: [],
    physics: { roll: 0, rollVel: 0, pitch: 0, pitchVel: 0, bounceY: 0, bounceVel: 0, yawKick: 0, yawVel: 0, lateralPush: 0, cooldown: 0, brakeIntensity: 0, swerveOffset: 0, targetLaneZ:  1.3 }
  },
  {
    laneZ:  3.1, dir:  1, relSpeed: 16.5, xOffset: 75,
    currentModel: null, currentRoot: null, wheels: [],
    physics: { roll: 0, rollVel: 0, pitch: 0, pitchVel: 0, bounceY: 0, bounceVel: 0, yawKick: 0, yawVel: 0, lateralPush: 0, cooldown: 0, brakeIntensity: 0, swerveOffset: 0, targetLaneZ:  3.1 }
  },
  {
    laneZ:  2.1, dir:  1, relSpeed: 12.0, xOffset: 110,
    currentModel: null, currentRoot: null, wheels: [],
    physics: { roll: 0, rollVel: 0, pitch: 0, pitchVel: 0, bounceY: 0, bounceVel: 0, yawKick: 0, yawVel: 0, lateralPush: 0, cooldown: 0, brakeIntensity: 0, swerveOffset: 0, targetLaneZ:  2.1 }
  },
];

const trafficGroup = new THREE.Group();
scene.add(trafficGroup);

function assignTrafficCars() {
  const availableIndices = [0, 1, 2, 3].filter((i) => i !== activeCarIndex);
  trafficSlots.forEach((slot, idx) => {
    const modelIndex = availableIndices[idx % availableIndices.length];
    const currentX = slot.currentRoot ? slot.currentRoot.position.x : slot.xOffset;

    if (slot.currentRoot) {
      trafficGroup.remove(slot.currentRoot);
    }

    const slotGroup = new THREE.Group();
    slotGroup.position.set(currentX, 0, slot.laneZ);
    if (slot.dir < 0) slotGroup.rotation.y = Math.PI;

    // Build a dedicated, independent 3D car model instance for this slot
    const meta = CAR_CATALOG[modelIndex];
    const carInstance = { ...meta, ...meta.builder() };
    slotGroup.add(carInstance.root);

    if (slot.dir < 0) {
      // Oncoming traffic on left side: glowing headlights facing the player
      const hlL = new THREE.Sprite(trafficHeadlightGlowMat.clone());
      const hlR = new THREE.Sprite(trafficHeadlightGlowMat.clone());
      const hPos = carInstance.headlightPos;
      hlL.scale.set(0.9, 0.45, 1);
      hlR.scale.set(0.9, 0.45, 1);
      hlL.position.set(hPos.x + 0.05, hPos.y, -hPos.z);
      hlR.position.set(hPos.x + 0.05, hPos.y,  hPos.z);
      slotGroup.add(hlL);
      slotGroup.add(hlR);
      slot.lightSprites = [hlL, hlR];
      slot.brakeSprites = null;
    } else {
      // Forward traffic on right side: red taillights & dynamic brake flares
      const brakeL = new THREE.Sprite(redGlowMat.clone());
      const brakeR = new THREE.Sprite(redGlowMat.clone());
      const tPos = carInstance.taillightPos;
      brakeL.scale.set(0.75, 0.35, 1);
      brakeR.scale.set(0.75, 0.35, 1);
      brakeL.position.set(tPos.x - 0.05, tPos.y, -tPos.z);
      brakeR.position.set(tPos.x - 0.05, tPos.y,  tPos.z);
      slotGroup.add(brakeL);
      slotGroup.add(brakeR);
      slot.brakeSprites = [brakeL, brakeR];
      slot.lightSprites = [brakeL, brakeR];
    }

    trafficGroup.add(slotGroup);

    slot.currentRoot = slotGroup;
    slot.wheels = carInstance.wheels;
    slot.modelData = carInstance;
  });
}
assignTrafficCars();

function setActiveCar(index) {
  if (index < 0 || index >= CAR_CATALOG.length || index === activeCarIndex) return;

  car.remove(playerCarData[activeCarIndex].root);
  activeCarIndex = index;
  const current = playerCarData[activeCarIndex];
  car.add(current.root);
  activeWheels = current.wheels;
  updatePlayerCarAccessories();

  const monogram = document.getElementById('car-monogram');
  if (monogram) monogram.textContent = current.monogram;
  const category = document.getElementById('car-category');
  if (category) category.textContent = current.category;
  const title = document.getElementById('car-title');
  if (title) title.innerHTML = `${current.title} <span style="font-weight:400; opacity:.58">${current.titleSub}</span>`;
  const descEyebrow = document.getElementById('desc-eyebrow');
  if (descEyebrow) descEyebrow.textContent = current.descEyebrow;
  const descCopy = document.getElementById('desc-copy');
  if (descCopy) descCopy.textContent = current.descCopy;

  document.querySelectorAll('.car-btn').forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.car) === activeCarIndex);
  });

  assignTrafficCars();
}

// ─── INTERSECTIONS, PEDESTRIAN LANES & TRAFFIC LIGHTS ─────────────────────────
const movingWorld = [];

const crosswalkPaintMat = new THREE.MeshStandardMaterial({ color: 0xf4f6ef, roughness: 0.52, metalness: 0.04 });
const tactileYellowMat  = new THREE.MeshStandardMaterial({ color: 0xf5b81a, roughness: 0.65, metalness: 0.05 });
const steelGantryMat    = new THREE.MeshStandardMaterial({ color: 0x222830, roughness: 0.42, metalness: 0.78 });
const signalBoxMat      = new THREE.MeshStandardMaterial({ color: 0x14171a, roughness: 0.62, metalness: 0.32 });

const signalRedMat    = new THREE.MeshStandardMaterial({ color: 0x3a0808, emissive: 0xff1e1e, emissiveIntensity: 0.05 });
const signalYellowMat = new THREE.MeshStandardMaterial({ color: 0x3a2c00, emissive: 0xffaa00, emissiveIntensity: 0.05 });
const signalGreenMat  = new THREE.MeshStandardMaterial({ color: 0x083214, emissive: 0x10ee55, emissiveIntensity: 3.6 });
const pedDontWalkMat  = new THREE.MeshStandardMaterial({ color: 0x330808, emissive: 0xff2211, emissiveIntensity: 3.2 });
const pedWalkMat      = new THREE.MeshStandardMaterial({ color: 0x083318, emissive: 0x22ff66, emissiveIntensity: 0.05 });

function makeSignalHead(parent, pos, rotY = 0) {
  const head = new THREE.Group();
  head.position.set(...pos);
  head.rotation.y = rotY;
  parent.add(head);

  box(head, [0.38, 1.08, 0.34], [0, 0, 0], signalBoxMat);

  cylinder(head, 0.12, 0.12, 0.05, 20, [0.18,  0.34, 0], [0, 0, Math.PI / 2], signalRedMat, { castShadow: false });
  cylinder(head, 0.12, 0.12, 0.05, 20, [0.18,  0.0,  0], [0, 0, Math.PI / 2], signalYellowMat, { castShadow: false });
  cylinder(head, 0.12, 0.12, 0.05, 20, [0.18, -0.34, 0], [0, 0, Math.PI / 2], signalGreenMat, { castShadow: false });

  for (const y of [0.34, 0.0, -0.34]) {
    box(head, [0.16, 0.032, 0.28], [0.22, y + 0.12, 0], signalBoxMat);
  }
}

function makePedSignal(parent, pos, rotY = 0) {
  const pedBox = new THREE.Group();
  pedBox.position.set(...pos);
  pedBox.rotation.y = rotY;
  parent.add(pedBox);

  box(pedBox, [0.28, 0.58, 0.28], [0, 0, 0], signalBoxMat);
  cylinder(pedBox, 0.09, 0.09, 0.04, 16, [0.13,  0.13, 0], [0, 0, Math.PI / 2], pedDontWalkMat, { castShadow: false });
  cylinder(pedBox, 0.09, 0.09, 0.04, 16, [0.13, -0.13, 0], [0, 0, Math.PI / 2], pedWalkMat, { castShadow: false });
}

function makeIntersection(x) {
  const group = new THREE.Group();
  group.position.set(x, 0, 0);

  // Pedestrian Zebra Crosswalk across all road lanes
  for (let i = 0; i < 13; i++) {
    const z = -5.7 + i * 0.95;
    box(group, [3.8, 0.024, 0.64], [0, 0.012, z], crosswalkPaintMat);
  }

  // Transverse Stop Lines
  box(group, [0.45, 0.026, 5.8], [-3.3, 0.014,  3.4], crosswalkPaintMat);
  box(group, [0.45, 0.026, 5.8], [ 3.3, 0.014, -3.4], crosswalkPaintMat);

  // Tactile Sidewalk Warning Mats at Curb Ramps
  for (const s of [-1, 1]) {
    box(group, [3.6, 0.035, 1.3], [0, 0.05, s * 7.15], tactileYellowMat);
  }

  // Traffic Light Gantry (Player Approach: sidewalk z = 7.35)
  {
    const gantry = new THREE.Group();
    gantry.position.set(-3.0, 0, 7.35);
    group.add(gantry);

    box(gantry, [0.52, 0.14, 0.52], [0, 0.07, 0], steelGantryMat);
    cylinder(gantry, 0.12, 0.17, 7.4, 16, [0, 3.7, 0], null, steelGantryMat);
    cylinder(gantry, 0.08, 0.11, 5.8, 14, [0, 6.9, -2.9], [Math.PI / 2, 0, 0], steelGantryMat);
    cylinder(gantry, 0.05, 0.05, 2.2, 8, [0, 6.2, -1.2], [Math.PI / 4, 0, 0], steelGantryMat);

    makeSignalHead(gantry, [0, 6.0, -3.2], Math.PI);
    makeSignalHead(gantry, [0, 6.0, -5.4], Math.PI);
    makeSignalHead(gantry, [0, 3.2, -0.3], Math.PI);
    makePedSignal(gantry,  [0, 2.3, -0.3], -Math.PI / 2);
  }

  // Traffic Light Gantry (Oncoming Approach: sidewalk z = -7.35)
  {
    const gantry2 = new THREE.Group();
    gantry2.position.set(3.0, 0, -7.35);
    group.add(gantry2);

    box(gantry2, [0.52, 0.14, 0.52], [0, 0.07, 0], steelGantryMat);
    cylinder(gantry2, 0.12, 0.17, 7.4, 16, [0, 3.7, 0], null, steelGantryMat);
    cylinder(gantry2, 0.08, 0.11, 5.8, 14, [0, 6.9, 2.9], [-Math.PI / 2, 0, 0], steelGantryMat);
    cylinder(gantry2, 0.05, 0.05, 2.2, 8, [0, 6.2, 1.2], [-Math.PI / 4, 0, 0], steelGantryMat);

    makeSignalHead(gantry2, [0, 6.0, 3.2], 0);
    makeSignalHead(gantry2, [0, 6.0, 5.4], 0);
    makeSignalHead(gantry2, [0, 3.2, 0.3], 0);
    makePedSignal(gantry2,  [0, 2.3, 0.3], Math.PI / 2);
  }

  scene.add(group);
  movingWorld.push({ group, lowerBound: -260, wrapSpan: 520 });
}

for (const x of [-195, -65, 65, 195]) {
  makeIntersection(x);
}

// ─── COMPLETE BROOKLYN BRIDGE (Shore-to-Shore Architectural Reference) ─────────
const brooklynBridgeGroup = new THREE.Group();
scene.add(brooklynBridgeGroup);

const bridgeStoneMat   = new THREE.MeshStandardMaterial({ color: 0x767066, roughness: 0.82, metalness: 0.08 });
const bridgeStoneDark  = new THREE.MeshStandardMaterial({ color: 0x423e38, roughness: 0.90, metalness: 0.06 });
const bridgeStoneLight = new THREE.MeshStandardMaterial({ color: 0x8e887e, roughness: 0.76, metalness: 0.06 });
const steelTrussMat    = new THREE.MeshStandardMaterial({ color: 0x262a32, roughness: 0.65, metalness: 0.75 });
const cableSteelMat    = new THREE.MeshStandardMaterial({ color: 0x363b44, roughness: 0.50, metalness: 0.88 });
const woodBoardwalkMat = new THREE.MeshStandardMaterial({ color: 0x544636, roughness: 0.88 });

// Luminous Necklace Lights (Alternating Emerald Green & Warm Diamond White)
const necklaceGreenMat = new THREE.MeshStandardMaterial({
  color: 0x15ee77,
  emissive: 0x12ff7a,
  emissiveIntensity: 3.8,
  roughness: 0.2,
});
const necklaceWhiteMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffeedd,
  emissiveIntensity: 3.4,
  roughness: 0.2,
});
const trafficHeadlights = new THREE.MeshStandardMaterial({ color: 0xffeedd, emissive: 0xffe8c8, emissiveIntensity: 2.8 });
const trafficTaillights = new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xee0000, emissiveIntensity: 2.8 });

// Neo-Gothic Granite Stone Suspension Tower with Dual Pointed Lancet Arches
function buildGothicTower(x, z, rotY = 0) {
  const tower = new THREE.Group();
  tower.position.set(x, 0, z);
  tower.rotation.y = rotY;

  const towerW = 34;
  const towerD = 14;

  // 1. Massive Submerged Caisson Foundation in East River Water
  box(tower, [towerW * 1.15, 9.5, towerD * 1.25], [0, 4.25, 0], bridgeStoneDark);
  box(tower, [towerW * 1.08, 2.0, towerD * 1.15], [0, 10.0, 0], bridgeStoneMat);

  // 2. Lower Battered Masonry Tower Body
  box(tower, [towerW, 14.0, towerD], [0, 18.0, 0], bridgeStoneMat);
  box(tower, [towerW * 1.04, 1.2, towerD * 1.08], [0, 25.6, 0], bridgeStoneLight);

  // 3. Dual Gothic Lancet Arch Portals (Open through-openings through which deck passes)
  const pierW = 5.6;
  const centerPierW = 6.8;
  const archW = (towerW - centerPierW - pierW * 2) / 2; // ~8m each
  const archH = 23;
  const archBaseY = 26.2;

  // Left, Center, Right Vertical Piers with stone reveals
  box(tower, [pierW, archH, towerD * 0.92], [-towerW / 2 + pierW / 2, archBaseY + archH / 2, 0], bridgeStoneMat);
  box(tower, [centerPierW, archH, towerD * 0.92], [0, archBaseY + archH / 2, 0], bridgeStoneMat);
  box(tower, [pierW, archH, towerD * 0.92], [towerW / 2 - pierW / 2, archBaseY + archH / 2, 0], bridgeStoneMat);

  // Pointed Gothic Arch Portals
  for (const dir of [-1, 1]) {
    const archCenterX = dir * (centerPierW / 2 + archW / 2);
    box(tower, [archW * 0.72, 1.4, towerD * 0.94], [archCenterX, archBaseY + archH - 1.2, 0], bridgeStoneLight, {
      rotation: [0, 0, dir * 0.20],
    });
    box(tower, [archW * 0.72, 1.4, towerD * 0.94], [archCenterX, archBaseY + archH - 1.2, 0], bridgeStoneLight, {
      rotation: [0, 0, -dir * 0.20],
    });
    box(tower, [1.6, 2.6, towerD * 0.96], [archCenterX, archBaseY + archH + 0.3, 0], bridgeStoneLight);
  }

  // Heavy Entablature & Molded Cornice above arches
  box(tower, [towerW * 1.06, 2.0, towerD * 1.06], [0, archBaseY + archH + 1.8, 0], bridgeStoneLight);

  // 4. Upper Attic Story & Pediments
  const atticH = 8.5;
  const atticBaseY = archBaseY + archH + 2.8;
  box(tower, [towerW * 0.96, atticH, towerD * 0.88], [0, atticBaseY + atticH / 2, 0], bridgeStoneMat);
  box(tower, [towerW * 1.02, 1.4, towerD * 0.94], [0, atticBaseY + atticH + 0.7, 0], bridgeStoneLight);

  // Spire finials on roofline
  box(tower, [3.6, 4.0, 3.6], [-towerW * 0.38, atticBaseY + atticH + 2.8, 0], bridgeStoneLight);
  box(tower, [4.8, 5.8, 4.8], [0, atticBaseY + atticH + 3.8, 0], bridgeStoneLight);
  box(tower, [3.6, 4.0, 3.6], [towerW * 0.38, atticBaseY + atticH + 2.8, 0], bridgeStoneLight);

  // Four Heavy Cast-Iron Cable Saddle Housings
  const saddleOffsets = [-7.6, -2.6, 2.6, 7.6];
  for (const so of saddleOffsets) {
    box(tower, [2.0, 2.4, 3.0], [so, atticBaseY + atticH + 1.8, 0], steelTrussMat);
  }

  // Architectural floodlighting illuminating stone tower
  const floodlightMat = new THREE.MeshStandardMaterial({
    color: 0xffb844,
    emissive: 0xff8811,
    emissiveIntensity: 2.8,
  });
  box(tower, [towerW * 1.1, 0.6, 1.2], [0, 10.2, towerD * 0.6], floodlightMat);
  box(tower, [towerW * 1.1, 0.6, 1.2], [0, 10.2, -towerD * 0.6], floodlightMat);

  return tower;
}

function buildCompleteBrooklynBridge() {
  const bridge = new THREE.Group();

  // Shore-to-shore bridge alignment: Brooklyn Shore -> East River -> Manhattan Shore
  // Safely positioned across the East River so no geometry intersects waterfront road
  const P0 = new THREE.Vector3(-180, 16.0, -65);   // Brooklyn Anchorage (across riverbank)
  const P1 = new THREE.Vector3(220, 16.0, -145);   // Manhattan Anchorage (deep in skyline)

  const bridgeDir = P1.clone().sub(P0);
  const bridgeLength = bridgeDir.length();
  const bridgeDirNorm = bridgeDir.clone().normalize();
  const bridgeAngle = -Math.atan2(bridgeDir.z, bridgeDir.x);
  const perpDir = new THREE.Vector3(-bridgeDirNorm.z, 0, bridgeDirNorm.x);

  // 1. Two Iconic Neo-Gothic Stone Towers standing in the East River water
  const t1 = 0.30;
  const t2 = 0.72;
  const posTowerB = P0.clone().lerp(P1, t1).setY(0);
  const posTowerM = P0.clone().lerp(P1, t2).setY(0);

  const towerRot = bridgeAngle - Math.PI / 2;
  const towerB = buildGothicTower(posTowerB.x, posTowerB.z, towerRot);
  const towerM = buildGothicTower(posTowerM.x, posTowerM.z, towerRot);
  bridge.add(towerB);
  bridge.add(towerM);

  // 2. Massive Rusticated Granite Anchorages on Both Shores
  box(bridge, [34, 22, 24], [P0.x, 10, P0.z], bridgeStoneDark, { rotation: [0, bridgeAngle, 0] });
  box(bridge, [34, 22, 24], [P1.x, 10, P1.z], bridgeStoneDark, { rotation: [0, bridgeAngle, 0] });

  // 3. Complete Roadway & Elevated Pedestrian Promenade Deck (412m length)
  const deckGroup = new THREE.Group();
  deckGroup.position.copy(P0.clone().lerp(P1, 0.5));
  deckGroup.rotation.y = bridgeAngle;

  const deckY = 24.5;
  const deckSpan = bridgeLength;

  // Steel underdeck floor structure & transverse crossbeams
  box(deckGroup, [deckSpan, 1.4, 16.0], [0, 0, 0], steelTrussMat);

  // Elevated central timber boardwalk promenade (pedestrians stroll above vehicle traffic)
  box(deckGroup, [deckSpan, 0.6, 5.0], [0, 1.4, 0], woodBoardwalkMat);
  for (const s of [-1, 1]) {
    box(deckGroup, [deckSpan, 1.0, 0.15], [0, 2.0, s * 2.5], steelTrussMat);
  }

  // Dual vehicle roadways with continuous headlight / taillight traffic streaks
  for (const s of [-1, 1]) {
    const rz = s * 5.5;
    box(deckGroup, [deckSpan, 0.2, 4.8], [0, 0.8, rz], steelTrussMat);
    const lightMat = s > 0 ? trafficHeadlights : trafficTaillights;
    box(deckGroup, [deckSpan, 0.18, 0.12], [0, 1.0, rz - 1.2], lightMat);
    box(deckGroup, [deckSpan, 0.18, 0.12], [0, 1.0, rz + 1.2], lightMat);
  }

  // Steel Stiffening Pratt Trusses (4 longitudinal continuous lattice truss lines)
  const trussOffsets = [-7.6, -2.6, 2.6, 7.6];
  for (const tz of trussOffsets) {
    box(deckGroup, [deckSpan, 3.8, 0.35], [0, 2.2, tz], steelTrussMat);
  }

  deckGroup.position.y = deckY;
  bridge.add(deckGroup);

  // 4. Four Continuous Main Suspension Cables across All 3 Spans
  const saddleY = 59.5;
  const cableOffsets = [-7.6, -2.6, 2.6, 7.6];

  cableOffsets.forEach((offset, cIdx) => {
    const offVec = perpDir.clone().multiplyScalar(offset);

    const bAnch = P0.clone().add(offVec);
    const mAnch = P1.clone().add(offVec);

    const bTop = posTowerB.clone().add(offVec).setY(saddleY);
    const mTop = posTowerM.clone().add(offVec).setY(saddleY);

    const bSideMid = bAnch.clone().lerp(bTop, 0.5);
    bSideMid.y = (bAnch.y + bTop.y) * 0.44;

    const riverMid = bTop.clone().lerp(mTop, 0.5);
    riverMid.y = deckY + 1.8;

    const mSideMid = mTop.clone().lerp(mAnch, 0.5);
    mSideMid.y = (mTop.y + mAnch.y) * 0.44;

    const curvePts = [bAnch, bSideMid, bTop, riverMid, mTop, mSideMid, mAnch];
    const catenary = new THREE.CatmullRomCurve3(curvePts);
    const cableMesh = new THREE.Mesh(new THREE.TubeGeometry(catenary, 64, 0.22, 6, false), cableSteelMat);
    bridge.add(cableMesh);

    // Glowing Necklace Lights along all 4 cables
    const samples = catenary.getPoints(52);
    samples.forEach((pt, sIdx) => {
      const isGreen = sIdx % 2 === 0;
      const mat = isGreen ? necklaceGreenMat : necklaceWhiteMat;
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 4), mat);
      bead.position.copy(pt);
      bridge.add(bead);
    });

    // Vertical suspender wire ropes connecting catenary cables to deck
    for (let s = 2; s < samples.length - 2; s += 2) {
      const pt = samples[s];
      if (pt.y > deckY + 1.2) {
        cylinder(bridge, 0.035, 0.035, pt.y - deckY, 4, [pt.x, (pt.y + deckY) / 2, pt.z], null, cableSteelMat);
      }
    }
  });

  // 5. Roebling's Iconic Radiating Diagonal Stay Wire Ropes
  const towers = [
    { pos: posTowerB, saddleY: saddleY },
    { pos: posTowerM, saddleY: saddleY }
  ];

  const deckDirNorm = bridgeDir.clone().normalize();

  towers.forEach(tInfo => {
    cableOffsets.forEach(cOff => {
      const offVec = perpDir.clone().multiplyScalar(cOff);
      const saddlePt = tInfo.pos.clone().add(offVec).setY(tInfo.saddleY - 1.2);

      // Radiate in both directions along the deck to form the spiderweb fan
      for (let dir of [-1, 1]) {
        for (let d = 1; d <= 8; d++) {
          const deckTarget = tInfo.pos.clone().add(offVec).add(deckDirNorm.clone().multiplyScalar(dir * d * 10));
          deckTarget.y = deckY + 1.2;
          beamBetween(bridge, [saddlePt.x, saddlePt.y, saddlePt.z], [deckTarget.x, deckTarget.y, deckTarget.z], 0.028, cableSteelMat);
        }
      }
    });
  });

  return bridge;
}

brooklynBridgeGroup.add(buildCompleteBrooklynBridge());

// ─── ELEVATED WATERFRONT EXPRESSWAY (FDR DRIVE) ───────────────────────────────
const fdrHighwayGroup = new THREE.Group();
scene.add(fdrHighwayGroup);

const fdrConcreteMat = new THREE.MeshStandardMaterial({ color: 0x363a40, roughness: 0.85, metalness: 0.1 });
const fdrAmberMat    = new THREE.MeshStandardMaterial({ color: 0xffaa22, emissive: 0xff8800, emissiveIntensity: 3.4 });
const fdrHeadlights  = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xd8eeff, emissiveIntensity: 2.8 });
const fdrTaillights  = new THREE.MeshStandardMaterial({ color: 0xff1e1e, emissive: 0xee0000, emissiveIntensity: 2.8 });

function buildFDRHighway() {
  const fdr = new THREE.Group();
  const fdrZ = -68;
  const fdrLength = 380;
  const deckY = 4.2;

  // Double-deck elevated highway
  box(fdr, [fdrLength, 0.55, 12], [0, deckY, fdrZ], fdrConcreteMat);
  box(fdr, [fdrLength, 0.45, 11.5], [0, deckY + 4.2, fdrZ], fdrConcreteMat);

  // Concrete support piers
  for (let i = 0; i < 22; i++) {
    const x = -180 + i * 18;
    cylinder(fdr, 0.45, 0.55, deckY + 4.2, 10, [x, (deckY + 4.2) / 2, fdrZ - 4.5], null, fdrConcreteMat);
    cylinder(fdr, 0.45, 0.55, deckY + 4.2, 10, [x, (deckY + 4.2) / 2, fdrZ + 4.5], null, fdrConcreteMat);
  }

  // Glowing ribbons of highway streetlights & traffic trails
  box(fdr, [fdrLength, 0.06, 0.08], [0, deckY + 4.6, fdrZ - 5.8], fdrAmberMat);
  box(fdr, [fdrLength, 0.06, 0.08], [0, deckY + 4.6, fdrZ + 5.8], fdrAmberMat);
  box(fdr, [fdrLength, 0.12, 0.25], [0, deckY + 0.35, fdrZ - 2.5], fdrHeadlights);
  box(fdr, [fdrLength, 0.12, 0.25], [0, deckY + 0.35, fdrZ + 2.5], fdrTaillights);

  return fdr;
}
fdrHighwayGroup.add(buildFDRHighway());

// ─── MANHATTAN & METROPOLIS SKYLINE ACROSS THE EAST RIVER ────────────────────
const manhattanSkylineGroup = new THREE.Group();
scene.add(manhattanSkylineGroup);

function seeded(seed) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

const facadeColors = [0x1e2733, 0x27313f, 0x22303c, 0x36322b, 0x2b2e35, 0x1f2937];
const facadeMaterials = facadeColors.map((color) => new THREE.MeshStandardMaterial({
  color,
  metalness: 0.35,
  roughness: 0.65,
}));
const facadeGlass = new THREE.MeshPhysicalMaterial({
  color: 0x14202e,
  metalness: 0.72,
  roughness: 0.18,
  clearcoat: 0.85,
  clearcoatRoughness: 0.15,
});
const windowWarm = new THREE.MeshStandardMaterial({
  color: 0xffba55,
  emissive: 0xff9922,
  emissiveIntensity: 1.25,
  roughness: 0.35,
});
const windowCool = new THREE.MeshStandardMaterial({
  color: 0x82cbff,
  emissive: 0x3890cc,
  emissiveIntensity: 0.95,
  roughness: 0.28,
});
const windowDark = new THREE.MeshStandardMaterial({
  color: 0x16202a,
  metalness: 0.4,
  roughness: 0.4,
});
const trimLight = new THREE.MeshStandardMaterial({
  color: 0x88d4e8,
  emissive: 0x22687c,
  emissiveIntensity: 0.9,
  metalness: 0.45,
  roughness: 0.25,
});
const neonOrangeMat = new THREE.MeshStandardMaterial({
  color: 0xff8822,
  emissive: 0xff6600,
  emissiveIntensity: 2.8,
});

function addWindowInstances(parent, placements, size, material) {
  if (placements.length === 0) return;
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(...size), material, placements.length);
  const transform = new THREE.Object3D();
  placements.forEach((position, index) => {
    transform.position.set(...position);
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  parent.add(mesh);
}

const woolworthGreenMat = new THREE.MeshStandardMaterial({
  color: 0x15ee77,
  emissive: 0x0dd668,
  emissiveIntensity: 3.6,
  roughness: 0.3,
});
const constructionAmberMat = new THREE.MeshStandardMaterial({
  color: 0xff8811,
  emissive: 0xee5500,
  emissiveIntensity: 2.4,
  roughness: 0.5,
});
const warningRedBeacon = new THREE.MeshStandardMaterial({
  color: 0xff1111,
  emissive: 0xff0000,
  emissiveIntensity: 3.8,
});
const brickApartmentMat = new THREE.MeshStandardMaterial({
  color: 0x42281e,
  roughness: 0.9,
  metalness: 0.05,
});

function buildWoolworthBuilding(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const limestoneMat = new THREE.MeshStandardMaterial({ color: 0x48423a, roughness: 0.82, metalness: 0.08 });
  const windowWarm = new THREE.MeshStandardMaterial({ color: 0xffcc77, emissive: 0xff9922, emissiveIntensity: 1.5 });

  // Main Gothic Tower Base (32m)
  box(group, [18, 32, 18], [0, 16, 0], limestoneMat);
  for (let lvl = 2; lvl < 9; lvl++) {
    box(group, [18.2, 0.8, 18.2], [0, lvl * 3.4, 0], windowWarm);
  }

  // Upper Tower Tier (54m)
  box(group, [12, 22, 12], [0, 43, 0], limestoneMat);
  for (let lvl = 10; lvl < 16; lvl++) {
    box(group, [12.2, 0.7, 12.2], [0, lvl * 3.3, 0], windowWarm);
  }

  // THE FAMOUS WOOLWORTH GREEN ILLUMINATED GOTHIC CROWN & SPIRE
  box(group, [8.4, 5, 8.4], [0, 56.5, 0], woolworthGreenMat);
  box(group, [6.0, 4, 6.0], [0, 60.5, 0], woolworthGreenMat);
  cylinder(group, 0.2, 2.4, 8, 8, [0, 66, 0], null, woolworthGreenMat);

  for (const dx of [-1, 1]) {
    for (const dz of [-1, 1]) {
      cylinder(group, 0.1, 0.6, 4, 6, [dx * 4.2, 57, dz * 4.2], null, woolworthGreenMat);
    }
  }

  return group;
}

function buildConstructionSkyscraper(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x34383e, roughness: 0.9, metalness: 0.04 });
  const craneYellowMat = new THREE.MeshStandardMaterial({ color: 0xee9911, emissive: 0x884400, emissiveIntensity: 0.8, metalness: 0.7 });

  box(group, [16, 50, 16], [0, 25, 0], concreteMat);
  box(group, [16.4, 14, 16.4], [0, 43, 0], constructionAmberMat);

  for (let f = 1; f < 5; f++) {
    box(group, [16.6, 0.6, 16.6], [0, 36 + f * 2.8, 0], constructionAmberMat);
  }

  // Rooftop heavy construction tower crane
  box(group, [1.0, 14, 1.0], [2, 57, -1], craneYellowMat);
  box(group, [24, 1.0, 1.0], [8, 64, -1], craneYellowMat);
  box(group, [7, 1.0, 1.0], [-3.5, 64, -1], craneYellowMat);
  box(group, [2.5, 2.0, 1.8], [-5.5, 63.5, -1], concreteMat);
  box(group, [0.8, 4, 0.8], [2, 66, -1], craneYellowMat);
  box(group, [0.4, 0.4, 0.4], [2, 68.2, -1], warningRedBeacon);

  return group;
}

function buildPyramidSkyscraper(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const modernMat = new THREE.MeshStandardMaterial({ color: 0x222a36, roughness: 0.5, metalness: 0.5 });
  const windowCool = new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x3388cc, emissiveIntensity: 1.2 });
  const crownGlow  = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xddeeff, emissiveIntensity: 2.8 });

  box(group, [15, 52, 15], [0, 26, 0], modernMat);
  for (let lvl = 2; lvl < 15; lvl++) {
    box(group, [15.2, 0.7, 15.2], [0, lvl * 3.3, 0], windowCool);
  }

  cylinder(group, 0.2, 8.5, 10, 4, [0, 57, 0], [0, Math.PI / 4, 0], crownGlow);
  cylinder(group, 0.08, 0.08, 4.5, 6, [0, 64, 0], null, crownGlow);
  box(group, [0.4, 0.4, 0.4], [0, 66.5, 0], warningRedBeacon);

  return group;
}

function buildBrickApartmentBlock(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const windowWarm = new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0xff9911, emissiveIntensity: 1.2 });

  box(group, [24, 34, 18], [0, 17, 0], brickApartmentMat);
  box(group, [18, 34, 24], [0, 17, 0], brickApartmentMat);

  for (let lvl = 1; lvl < 10; lvl++) {
    box(group, [24.2, 0.7, 18.2], [0, lvl * 3.2, 0], windowWarm);
    box(group, [18.2, 0.7, 24.2], [0, lvl * 3.2, 0], windowWarm);
  }

  return group;
}

function buildSkylineTower(x, z, w, h, d, colorType, seed) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e2632, roughness: 0.6, metalness: 0.4 });
  const litMat = colorType === 'warm'
    ? new THREE.MeshStandardMaterial({ color: 0xffcc77, emissive: 0xff9922, emissiveIntensity: 1.1 })
    : new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x3388cc, emissiveIntensity: 0.95 });

  box(group, [w, h, d], [0, h / 2, 0], bodyMat);

  const levels = Math.floor(h / 3.4);
  for (let lvl = 2; lvl < levels; lvl++) {
    if (lvl % 2 === 0) {
      box(group, [w + 0.15, 0.8, d + 0.15], [0, lvl * 3.2, 0], litMat);
    }
  }

  box(group, [w * 0.45, 2.5, d * 0.45], [0, h + 1.25, 0], bodyMat);
  box(group, [0.35, 0.35, 0.35], [0, h + 2.8, 0], warningRedBeacon);

  return group;
}

// ─── MODERN METROPOLIS SUPERTALLS & FLYOVERS (Matching Reference Photo) ──────
const kkCrownGlow   = new THREE.MeshStandardMaterial({ color: 0xffe6aa, emissive: 0xffaa33, emissiveIntensity: 3.6 });
const diwangCyanMat = new THREE.MeshStandardMaterial({ color: 0x00f5aa, emissive: 0x00dd88, emissiveIntensity: 3.5 });
const ledFinBlueMat = new THREE.MeshStandardMaterial({ color: 0x44bbff, emissive: 0x2288ee, emissiveIntensity: 3.8 });

function buildKK100Supertall(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x122438, metalness: 0.82, roughness: 0.14, clearcoat: 1.0 });
  const totalH = 138;
  const tiers = 6;

  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    const tierH = totalH / tiers;
    const w = 24 * (1 - t * 0.44);
    const d = 20 * (1 - t * 0.42);
    const y = i * tierH + tierH / 2;
    box(group, [w, tierH * 0.98, d], [0, y, 0], glassMat);
    box(group, [0.4, tierH, 0.4], [-w * 0.48, y, d * 0.48], ledFinBlueMat, { castShadow: false });
    box(group, [0.4, tierH, 0.4], [ w * 0.48, y, d * 0.48], ledFinBlueMat, { castShadow: false });
    for (let f = 1; f < 5; f++) {
      box(group, [w + 0.12, 0.8, d + 0.12], [0, i * tierH + f * (tierH / 5), 0], (i % 2 === 0 ? windowWarm : windowCool), { castShadow: false });
    }
  }

  // Parabolic Arched Crown with glowing sky restaurant
  cylinder(group, 5.0, 9.5, 14, 16, [0, totalH + 7, 0], null, kkCrownGlow);
  cylinder(group, 1.2, 4.5, 9, 12, [0, totalH + 18, 0], null, kkCrownGlow);
  box(group, [0.5, 0.5, 0.5], [0, totalH + 23, 0], warningRedBeacon);

  return group;
}

function buildDiwangTwinSpires(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const towerMat = new THREE.MeshStandardMaterial({ color: 0x182836, roughness: 0.55, metalness: 0.65 });

  // Main 112m glass skyscraper
  box(group, [22, 112, 16], [0, 56, 0], towerMat);
  for (let lvl = 2; lvl < 30; lvl += 2) {
    box(group, [22.2, 0.8, 16.2], [0, lvl * 3.6, 0], windowCool, { castShadow: false });
  }

  // Stepped green illuminated crown
  box(group, [18, 8, 14], [0, 116, 0], towerMat);
  box(group, [14, 7, 11], [0, 123.5, 0], diwangCyanMat);
  box(group, [9, 5, 8], [0, 129.5, 0], diwangCyanMat);

  // Twin Iconic Needle Spires with pulsing red hazard beacons
  for (const sx of [-5.2, 5.2]) {
    cylinder(group, 0.18, 0.6, 22, 8, [sx, 142, 0], null, diwangCyanMat);
    box(group, [0.45, 0.45, 0.45], [sx, 153.5, 0], warningRedBeacon);
  }

  return group;
}

function buildSlantedGlassTower(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const modernMat = new THREE.MeshPhysicalMaterial({ color: 0x1a2e44, metalness: 0.78, roughness: 0.16, clearcoat: 0.9 });
  const h = 98;
  box(group, [18, h, 18], [0, h / 2, 0], modernMat);
  for (let lvl = 2; lvl < 26; lvl += 2) {
    box(group, [18.2, 0.85, 18.2], [0, lvl * 3.6, 0], (lvl % 4 === 0 ? windowWarm : windowCool), { castShadow: false });
  }

  // Slanted 45-degree roof wedge with glowing atrium
  box(group, [17, 10, 17], [0, h + 4.5, 0], kkCrownGlow, { rotation: [0, 0, 0.35] });
  cylinder(group, 0.15, 0.4, 12, 6, [0, h + 15, 0], null, ledFinBlueMat);
  box(group, [0.4, 0.4, 0.4], [0, h + 21.5, 0], warningRedBeacon);

  return group;
}

function buildCurvedFlyovers() {
  const group = new THREE.Group();
  const flyoverMat = new THREE.MeshStandardMaterial({ color: 0x2e343c, roughness: 0.85, metalness: 0.2 });
  const sodiumAmber = new THREE.MeshStandardMaterial({ color: 0xffa022, emissive: 0xff7700, emissiveIntensity: 3.6 });
  const flyoverHeadlights = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xddeeff, emissiveIntensity: 3.2 });
  const flyoverTaillights = new THREE.MeshStandardMaterial({ color: 0xff1a1a, emissive: 0xff0000, emissiveIntensity: 3.2 });

  const curvePoints = [];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const x = -190 + t * 380;
    const z = -60 + Math.sin(t * Math.PI * 1.5) * 14;
    const y = 3.5 + Math.sin(t * Math.PI) * 4.5;
    curvePoints.push(new THREE.Vector3(x, y, z));
  }
  const rampCurve = new THREE.CatmullRomCurve3(curvePoints);
  const rampMesh = new THREE.Mesh(new THREE.TubeGeometry(rampCurve, 48, 2.6, 6, false), flyoverMat);
  rampMesh.scale.set(1, 0.25, 1);
  group.add(rampMesh);

  const samples = rampCurve.getPoints(36);
  for (let i = 0; i < samples.length - 1; i++) {
    const p1 = samples[i];
    const p2 = samples[i + 1];
    beamBetween(group, [p1.x, p1.y + 0.32, p1.z - 1.1], [p2.x, p2.y + 0.32, p2.z - 1.1], 0.07, flyoverHeadlights);
    beamBetween(group, [p1.x, p1.y + 0.32, p1.z + 1.1], [p2.x, p2.y + 0.32, p2.z + 1.1], 0.07, flyoverTaillights);
    beamBetween(group, [p1.x, p1.y + 0.52, p1.z - 1.5], [p2.x, p2.y + 0.52, p2.z - 1.5], 0.04, sodiumAmber);
    beamBetween(group, [p1.x, p1.y + 0.52, p1.z + 1.5], [p2.x, p2.y + 0.52, p2.z + 1.5], 0.04, sodiumAmber);

    if (i % 4 === 0) {
      cylinder(group, 0.45, 0.65, p1.y, 8, [p1.x, p1.y / 2, p1.z], null, flyoverMat);
    }
  }

  return group;
}

// ─── ONE WORLD TRADE CENTER (Freedom Tower — Reference Picture Matching) ────
function buildOneWorldTradeCenter(x, z) {
  const owtc = new THREE.Group();
  owtc.position.set(x, 0, z);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x3d7098,
    roughness: 0.08,
    metalness: 0.92,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
  });
  const podiumMat = new THREE.MeshStandardMaterial({
    color: 0x68707a,
    roughness: 0.72,
    metalness: 0.28,
  });
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 4.8,
  });

  // 1. Granite & Glass Prismatic Podium Base
  const baseW = 28;
  const baseH = 26;
  box(owtc, [baseW, baseH, baseW], [0, baseH / 2, 0], podiumMat);

  // 2. Chamfered Prismatic Tapering Octagonal Tower
  const tiers = 5;
  const towerH = 105;
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    const yBot = baseH + t * towerH;
    const tierH = towerH / tiers;
    const scale = 1.0 - t * 0.22;
    const w = baseW * scale;

    // Center core
    box(owtc, [w, tierH, w], [0, yBot + tierH / 2, 0], glassMat);
    // Triangular chamfered corner facets
    const cornerW = w * 0.32;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        box(owtc, [cornerW, tierH, cornerW], [sx * (w * 0.42), yBot + tierH / 2, sz * (w * 0.42)], glassMat, {
          rotation: [0, Math.PI / 4, 0],
        });
      }
    }
    // Floor level illumination rings
    box(owtc, [w * 1.02, 0.4, w * 1.02], [0, yBot, 0], windowCool, { castShadow: false });
  }

  // 3. Circular Observation Ring & Crown Parapet
  const crownY = baseH + towerH;
  cylinder(owtc, baseW * 0.38, baseW * 0.42, 4.2, 16, [0, crownY + 2.1, 0], null, podiumMat);

  // 4. Iconic Communications Spire & Aviation Beacon (reaching 160m+)
  const spireBaseY = crownY + 4.2;
  const spireH = 34;
  cylinder(owtc, 0.35, 1.8, spireH, 8, [0, spireBaseY + spireH / 2, 0], null, podiumMat);
  for (let r = 1; r <= 3; r++) {
    cylinder(owtc, 1.4 - r * 0.3, 1.4 - r * 0.3, 0.6, 8, [0, spireBaseY + r * 6.5, 0], null, podiumMat);
  }
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 6), beaconMat);
  beacon.position.set(0, spireBaseY + spireH, 0);
  owtc.add(beacon);

  return owtc;
}

// Assemble landmark modern metropolis skyline across the river
manhattanSkylineGroup.add(buildOneWorldTradeCenter(28, -145)); // Positioned directly behind Brooklyn Bridge main span
manhattanSkylineGroup.add(buildKK100Supertall(12, -108));
manhattanSkylineGroup.add(buildDiwangTwinSpires(-35, -118));
manhattanSkylineGroup.add(buildSlantedGlassTower(68, -100));
manhattanSkylineGroup.add(buildCurvedFlyovers());
manhattanSkylineGroup.add(buildWoolworthBuilding(38, -84));
manhattanSkylineGroup.add(buildConstructionSkyscraper(-18, -78));
manhattanSkylineGroup.add(buildPyramidSkyscraper(-56, -92));
manhattanSkylineGroup.add(buildBrickApartmentBlock(85, -72));
manhattanSkylineGroup.add(buildBrickApartmentBlock(-105, -76));
manhattanSkylineGroup.add(buildBrickApartmentBlock(125, -88));
manhattanSkylineGroup.add(buildBrickApartmentBlock(-140, -82));

// Fill out remaining Manhattan high-rise towers
const skylinePositions = [
  [-155, -98, 18, 60, 18, 'cool', 1],
  [-122, -90, 16, 72, 16, 'warm', 2],
  [-88,  -102, 20, 78, 20, 'cool', 3],
  [-42,  -86, 16, 64, 16, 'warm', 4],
  [-2,   -94, 18, 82, 18, 'cool', 5],
  [52,   -98, 17, 68, 17, 'warm', 6],
  [98,   -88, 19, 62, 19, 'cool', 7],
  [130,  -96, 16, 74, 16, 'warm', 8],
  [168,  -102, 20, 58, 20, 'cool', 9],
  [-175, -106, 15, 50, 15, 'warm', 10],
  [180,  -108, 17, 56, 17, 'cool', 11],
  [-48,  -112, 14, 88, 14, 'warm', 12],
  [22,   -116, 22, 92, 22, 'cool', 13],
];
skylinePositions.forEach(([x, z, w, h, d, col, s]) => {
  manhattanSkylineGroup.add(buildSkylineTower(x, z, w, h, d, col, s));
});

// ─── PROCEDURAL RANDOMIZED INLAND BUILDINGS (6 Architectural Archetypes) ──────
function makeRandomBuilding(x, side, index, isBackRow = false) {
  const group = new THREE.Group();
  const seed = index * 17 + (isBackRow ? 450 : 25) + (side > 0 ? 11 : 73);

  // Randomized dimensions
  const width  = isBackRow ? (16 + seeded(seed) * 14) : (13 + seeded(seed) * 10);
  const depth  = isBackRow ? (10 + seeded(seed + 1) * 8) : (8 + seeded(seed + 1) * 6);
  const height = isBackRow ? (32 + seeded(seed + 2) * 58) : (18 + seeded(seed + 2) * 38);

  const zBase = isBackRow ? (22 + depth / 2) : (10.5 + depth / 2);
  group.position.set(x, 0.05, side * zBase);

  const nearFace = -side * (depth / 2 + 0.045);
  const facadeMat = facadeMaterials[Math.floor(seeded(seed + 3) * facadeMaterials.length)];
  const archetype = Math.floor(seeded(seed + 4) * 6); // 6 distinct architectural styles

  if (archetype === 0) {
    // Archetype 0: Stepped Setback High-Rise (3 cascading tiers with sky gardens)
    const t1H = height * 0.45;
    box(group, [width, t1H, depth], [0, t1H / 2, 0], facadeMat);
    const t2W = width * 0.78, t2D = depth * 0.82, t2H = height * 0.35;
    box(group, [t2W, t2H, t2D], [0, t1H + t2H / 2, 0], facadeMat);
    box(group, [t2W + 0.4, 0.5, t2D + 0.4], [0, t1H + 0.25, 0], trimLight, { castShadow: false });
    const t3W = width * 0.55, t3D = depth * 0.65, t3H = height * 0.20;
    box(group, [t3W, t3H, t3D], [0, t1H + t2H + t3H / 2, 0], facadeGlass);
    box(group, [0.35, 6.0, 0.35], [0, height + 3.0, 0], trimLight, { castShadow: false });
    box(group, [0.35, 0.35, 0.35], [0, height + 6.2, 0], warningRedBeacon);
  } else if (archetype === 1) {
    // Archetype 1: Slanted Crown Glass Tower (modern angled roof with glowing atrium)
    box(group, [width, height, depth], [0, height / 2, 0], facadeMat);
    const crownMat = seeded(seed + 5) > 0.5 ? windowWarm : trimLight;
    box(group, [width * 0.85, 4.5, depth * 0.85], [0, height + 2.0, 0], crownMat, {
      rotation: [0, 0, (seeded(seed + 6) > 0.5 ? 1 : -1) * 0.25],
      castShadow: false,
    });
    cylinder(group, 0.1, 0.25, 8, 6, [width * 0.3, height + 6.0, 0], null, trimLight);
    box(group, [0.3, 0.3, 0.3], [width * 0.3, height + 10.2, 0], warningRedBeacon);
  } else if (archetype === 2) {
    // Archetype 2: Curved / Rounded Corner Commercial Tower
    box(group, [width, height, depth], [0, height / 2, 0], facadeMat);
    // Rounded corner glass cylindrical columns
    for (const sx of [-width * 0.46, width * 0.46]) {
      cylinder(group, 1.2, 1.2, height, 12, [sx, height / 2, nearFace + 0.2], null, facadeGlass);
    }
    // Glowing halo disc on roof
    torus(group, width * 0.35, 0.35, 8, 24, [0, height + 1.2, 0], [Math.PI / 2, 0, 0], trimLight);
  } else if (archetype === 3) {
    // Archetype 3: Twin-Wing Tower with Skybridge
    const wingW = width * 0.42;
    box(group, [wingW, height, depth], [-width * 0.28, height / 2, 0], facadeMat);
    box(group, [wingW, height, depth], [ width * 0.28, height / 2, 0], facadeMat);
    // Illuminated central skybridge at 65% height
    box(group, [width * 0.36, 4.2, depth * 0.7], [0, height * 0.65, 0], windowWarm, { castShadow: false });
    box(group, [width * 0.36, 0.4, depth * 0.72], [0, height * 0.65 + 2.3, 0], trimLight, { castShadow: false });
  } else if (archetype === 4) {
    // Archetype 4: Retail Podium & Slender Mixed-Use Tower
    const podiumH = 4.8;
    box(group, [width * 1.15, podiumH, depth * 1.1], [0, podiumH / 2, 0], facadeGlass);
    box(group, [width * 1.15, 0.4, 0.5], [0, podiumH + 0.2, nearFace - 0.4], neonOrangeMat, { castShadow: false });
    const towerW = width * 0.82;
    box(group, [towerW, height - podiumH, depth * 0.85], [0, podiumH + (height - podiumH) / 2, 0], facadeMat);
    // Rooftop Helipad
    cylinder(group, 4.2, 4.2, 0.6, 16, [0, height + 0.3, 0], null, facadeMaterials[0]);
    torus(group, 3.8, 0.12, 6, 20, [0, height + 0.65, 0], [Math.PI / 2, 0, 0], trimLight);
  } else {
    // Archetype 5: Vertical Architectural LED Fin Tower
    box(group, [width, height, depth], [0, height / 2, 0], facadeMat);
    for (let f = -2; f <= 2; f++) {
      box(group, [0.18, height + 3.2, 0.3], [f * (width * 0.22), (height + 3.2) / 2, nearFace - 0.1], ledFinBlueMat, { castShadow: false });
    }
  }

  // Street-level retail base for front row buildings
  if (!isBackRow) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 2.8, depth + 0.15), facadeGlass);
    base.position.y = 1.42;
    group.add(base);
    // Glowing retail signage
    const signMat = seeded(seed + 7) > 0.4 ? windowWarm : neonOrangeMat;
    box(group, [Math.min(width * 0.62, 7.5), 0.55, 0.16], [0, 2.9, nearFace - 0.12], signMat, { castShadow: false });
  }

  // Window grid distribution
  const cols = Math.max(3, Math.floor(width / 2.4));
  const rows = Math.max(3, Math.floor((height - 3.8) / 3.0));
  const warmPositions = [], coolPositions = [], darkPositions = [];
  const startX = -((cols - 1) * 2.3) / 2;
  const startY = 3.8;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = startX + c * 2.3;
      const py = startY + r * 2.95;
      const pz = nearFace;
      const choice = seeded(seed + r * 13 + c * 7);
      if (choice < 0.42) warmPositions.push([px, py, pz]);
      else if (choice < 0.62) coolPositions.push([px, py, pz]);
      else darkPositions.push([px, py, pz]);
    }
  }

  const winSize = [1.2, 1.8, 0.07];
  addWindowInstances(group, warmPositions, winSize, windowWarm);
  addWindowInstances(group, coolPositions, winSize, windowCool);
  addWindowInstances(group, darkPositions, winSize, windowDark);

  scene.add(group);
  movingWorld.push({ group, lowerBound: -260, wrapSpan: 520 });
}

// Generate randomized street buildings (Row 1: front urban canyon, Row 2: background skyscrapers)
const inlandSide = 1;
for (let i = 0; i < 38; i++) {
  makeRandomBuilding(-247 + i * 14, inlandSide, i, false);
}
for (let i = 0; i < 28; i++) {
  makeRandomBuilding(-247 + i * 18, inlandSide, i, true);
}

// ─── Streetlights ─────────────────────────────────────────────────────────────
const lampBody = new THREE.MeshStandardMaterial({ color: 0x1a222c, metalness: 0.78, roughness: 0.32 });
const lampGlow = new THREE.MeshStandardMaterial({
  color: 0xffe4b6,
  emissive: 0xffad53,
  emissiveIntensity: 3.2,
  roughness: 0.26,
});

function makeGlowPoolTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 4, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 200, 120, 0.72)');
  grad.addColorStop(0.3, 'rgba(255, 174, 87, 0.28)');
  grad.addColorStop(0.7, 'rgba(255, 160, 60, 0.08)');
  grad.addColorStop(1, 'rgba(255, 140, 40, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

const glowPoolMaterial = new THREE.MeshBasicMaterial({
  map: makeGlowPoolTexture(),
  color: 0xffd19b,
  transparent: true,
  opacity: 0.42,
  depthWrite: false,
  side: THREE.DoubleSide,
});

function makeLensFlareTex() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,230,160,0.95)');
  g.addColorStop(0.18, 'rgba(255,210,120,0.6)');
  g.addColorStop(0.55, 'rgba(255,180,80,0.15)');
  g.addColorStop(1, 'rgba(255,160,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const lensFlareMat = new THREE.SpriteMaterial({
  map: makeLensFlareTex(),
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

function makeStreetlight(x, side) {
  const group = new THREE.Group();
  group.position.set(x, 0.045, side * 7.7);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.14, 7.2, 14), lampBody);
  pole.position.y = 3.65;
  pole.castShadow = true;
  group.add(pole);

  const inward = -side;
  const armCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 6.95, 0),
    new THREE.Vector3(0, 7.35, inward * 0.42),
    new THREE.Vector3(0, 7.34, inward * 1.15),
    new THREE.Vector3(0, 7.16, inward * 1.5),
  ]);
  const arm = new THREE.Mesh(new THREE.TubeGeometry(armCurve, 24, 0.052, 8, false), lampBody);
  arm.castShadow = true;
  group.add(arm);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.14, 0.34), lampBody);
  head.position.set(0, 7.15, inward * 1.55);
  head.castShadow = true;
  group.add(head);

  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.025, 0.23), lampGlow);
  panel.position.set(0, 7.065, inward * 1.55);
  group.add(panel);

  const flare = new THREE.Sprite(lensFlareMat.clone());
  flare.scale.set(2.8, 2.8, 1);
  flare.position.set(0, 7.07, inward * 1.55);
  group.add(flare);

  const pool = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), glowPoolMaterial);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0, 0.018, inward * 4.05);
  pool.renderOrder = 2;
  group.add(pool);

  scene.add(group);
  movingWorld.push({ group, lowerBound: -250, wrapSpan: 500 });
}

for (const side of [-1, 1]) {
  for (let i = 0; i < 17; i += 1) {
    makeStreetlight(-232 + i * 29, side);
  }
}

// ─── Park Benches ─────────────────────────────────────────────────────────────
const benchWood  = new THREE.MeshStandardMaterial({ color: 0x5c3d1e, roughness: 0.82, metalness: 0.04 });
const benchMetal = new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.52, metalness: 0.72 });

function makeBench(x, side) {
  const group = new THREE.Group();
  group.position.set(x, 0.045, side * 7.5);
  // Waterfront benches face toward the river & Brooklyn Bridge
  if (side < 0) group.rotation.y = Math.PI;

  for (let s = 0; s < 4; s++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.07, 0.14), benchWood);
    slat.position.set(0, 0.46, -0.26 + s * 0.18);
    slat.castShadow = true;
    slat.receiveShadow = true;
    group.add(slat);
  }

  for (let s = 0; s < 3; s++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.065, 0.1), benchWood);
    slat.position.set(0, 0.72 + s * 0.14, 0.26);
    slat.rotation.x = 0.14;
    slat.castShadow = true;
    group.add(slat);
  }

  for (const lr of [-1, 1]) {
    const fl = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.44, 0.055), benchMetal);
    fl.position.set(lr * 0.65, 0.22, -0.26);
    fl.castShadow = true;
    group.add(fl);
    const rl = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.5, 0.055), benchMetal);
    rl.position.set(lr * 0.65, 0.3, 0.26);
    rl.rotation.x = 0.22;
    rl.castShadow = true;
    group.add(rl);
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.6), benchMetal);
    br.position.set(lr * 0.65, 0.16, 0.0);
    group.add(br);
  }

  scene.add(group);
  movingWorld.push({ group, lowerBound: -260, wrapSpan: 520 });
}

for (const side of [-1, 1]) {
  for (let i = 0; i < 13; i++) {
    makeBench(-220 + i * 40 + (side > 0 ? 0 : 20), side);
  }
}

// ─── Street Trees ─────────────────────────────────────────────────────────────
const treeGrateMat = new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.65, metalness: 0.7 });
const treeBarkMat  = new THREE.MeshStandardMaterial({ color: 0x36281e, roughness: 0.88, metalness: 0.02 });
const treeCanopyMats = [
  new THREE.MeshStandardMaterial({ color: 0x163426, roughness: 0.78, metalness: 0.02 }),
  new THREE.MeshStandardMaterial({ color: 0x1e4231, roughness: 0.74, metalness: 0.02 }),
  new THREE.MeshStandardMaterial({ color: 0x26553e, roughness: 0.70, metalness: 0.02 }),
];

function makeStreetTree(x, side, seed) {
  const group = new THREE.Group();
  group.position.set(x, 0.045, side * 8.35);

  const grate = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.025, 1.45), treeGrateMat);
  grate.position.y = 0.005;
  grate.receiveShadow = true;
  group.add(grate);

  const soil = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.028, 0.7), treeBarkMat);
  soil.position.y = 0.007;
  group.add(soil);

  const trunkHeight = 3.6 + seeded(seed) * 0.8;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, trunkHeight, 8), treeBarkMat);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  for (let b = 0; b < 3; b++) {
    const bAngle = (b / 3) * Math.PI * 2 + seeded(seed + b) * 0.5;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 1.4, 6), treeBarkMat);
    branch.position.set(Math.sin(bAngle) * 0.35, trunkHeight - 0.4 + b * 0.25, Math.cos(bAngle) * 0.35);
    branch.rotation.z = Math.cos(bAngle) * 0.55;
    branch.rotation.x = Math.sin(bAngle) * 0.55;
    branch.castShadow = true;
    group.add(branch);
  }

  const canopyGroup = new THREE.Group();
  canopyGroup.position.y = trunkHeight + 0.6;
  const clusterOffsets = [
    [0, 0.3, 0, 1.45],
    [0.75, 0.1, 0.45, 1.1],
    [-0.7, 0.05, -0.4, 1.15],
    [-0.45, 0.4, 0.65, 1.05],
    [0.55, 0.45, -0.6, 1.0],
    [0, 1.1, 0, 1.25],
  ];

  clusterOffsets.forEach(([cx, cy, cz, scale], idx) => {
    const mat = treeCanopyMats[idx % treeCanopyMats.length];
    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(scale, 1), mat);
    foliage.position.set(cx, cy, cz);
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    canopyGroup.add(foliage);
  });
  group.add(canopyGroup);

  scene.add(group);
  movingWorld.push({ group, lowerBound: -260, wrapSpan: 520 });
}

for (const side of [-1, 1]) {
  for (let i = 0; i < 15; i++) {
    makeStreetTree(-238 + i * 35 + (side > 0 ? 0 : 17), side, i * 13 + (side > 0 ? 5 : 43));
  }
}

// ─── City Glow Accent Point Lights (Waterfront Atmosphere) ───────────────────
// Amber streetlight halos along the inland side
for (let i = 0; i < 12; i++) {
  const pl = new THREE.PointLight(0xff9933, 3.2, 28, 2.0);
  pl.position.set(-220 + i * 42, 7.2, 7.8);
  scene.add(pl);
}
// Cyan/teal glow from the water-side railing (city-on-water reflection feel)
for (let i = 0; i < 8; i++) {
  const pl = new THREE.PointLight(0x22aaff, 1.8, 20, 2.2);
  pl.position.set(-175 + i * 54, 3.5, -8.8);
  scene.add(pl);
}
// Deep emerald green from Brooklyn Bridge necklace lights reflecting on walkway
const bridgeGlow1 = new THREE.PointLight(0x00ff88, 2.4, 22, 2.0);
bridgeGlow1.position.set(-15, 5, -18);
scene.add(bridgeGlow1);
const bridgeGlow2 = new THREE.PointLight(0x00ff88, 1.8, 18, 2.0);
bridgeGlow2.position.set(10, 4, -22);
scene.add(bridgeGlow2);

// ─── ROUTE 1: ELEVATED EXPRESSWAY / SKYWAY (y = 7.8) ───────────────────────────
const skywayGroup = new THREE.Group();
scene.add(skywayGroup);

const highwayGreenMat  = new THREE.MeshStandardMaterial({ color: 0x005828, roughness: 0.45, metalness: 0.1 });
const highwayTextMat   = new THREE.MeshStandardMaterial({ color: 0xf4f7f4, emissive: 0xdde5dd, emissiveIntensity: 1.1 });
const highwayYellowMat = new THREE.MeshStandardMaterial({ color: 0xf5b81a, emissive: 0xaa7805, emissiveIntensity: 1.0 });

function buildSkywayRoute() {
  const skyway = new THREE.Group();
  const deckY = 7.8;
  const length = 720;
  const width = 12.2;

  // 1. Concrete deck slab
  box(skyway, [length, 0.65, width], [0, deckY - 0.35, 0], fdrConcreteMat);

  // 2. Asphalt roadway surface
  const skywayAsphalt = new THREE.Mesh(
    new THREE.PlaneGeometry(length, width - 1.2),
    new THREE.MeshStandardMaterial({ map: asphaltTexture, color: 0xc4c7c9, roughness: 0.90, metalness: 0.04 })
  );
  skywayAsphalt.rotation.x = -Math.PI / 2;
  skywayAsphalt.position.set(0, deckY + 0.005, 0);
  skywayAsphalt.receiveShadow = true;
  skyway.add(skywayAsphalt);

  // 3. Lane Markings
  box(skyway, [length, 0.02, 0.06], [0, deckY + 0.015, -0.09], centerStripeMaterial);
  box(skyway, [length, 0.02, 0.06], [0, deckY + 0.015,  0.09], centerStripeMaterial);
  box(skyway, [length, 0.02, 0.10], [0, deckY + 0.015, -width / 2 + 0.8], roadEdgePaint);
  box(skyway, [length, 0.02, 0.10], [0, deckY + 0.015,  width / 2 - 0.8], roadEdgePaint);

  // 4. Concrete Jersey Crash Barriers with Top Tubular Steel Rail
  for (const s of [-1, 1]) {
    const bZ = s * (width / 2 - 0.3);
    box(skyway, [length, 0.88, 0.38], [0, deckY + 0.44, bZ], fdrConcreteMat);
    box(skyway, [length, 0.08, 0.08], [0, deckY + 0.96, bZ], steelTrussMat);
    for (let x = -350; x < 350; x += 16) {
      box(skyway, [0.08, 0.15, 0.04], [x, deckY + 0.65, bZ + (s > 0 ? -0.2 : 0.2)], s > 0 ? trafficHeadlights : trafficTaillights);
    }
  }

  // 5. Massive Concrete Viaduct Columns down to ground level (placed safely at z = ±7.2, outside road)
  for (let x = -350; x <= 350; x += 35) {
    cylinder(skyway, 0.5, 0.62, deckY - 0.7, 10, [x, (deckY - 0.7) / 2, -7.2], null, fdrConcreteMat);
    cylinder(skyway, 0.5, 0.62, deckY - 0.7, 10, [x, (deckY - 0.7) / 2,  7.2], null, fdrConcreteMat);
    box(skyway, [2.2, 0.85, 15.6], [x, deckY - 0.75, 0], fdrConcreteMat);
  }

  return skyway;
}
skywayGroup.add(buildSkywayRoute());
skywayGroup.visible = false;

// Overhead Highway Sign Gantries
function makeSkywayGantry(x) {
  const gantry = new THREE.Group();
  gantry.position.set(x, 7.8, 0);

  const spanW = 13.8;
  const gantryH = 5.2;

  for (const s of [-1, 1]) {
    box(gantry, [0.45, gantryH, 0.45], [0, gantryH / 2, s * (spanW / 2)], steelTrussMat);
  }
  box(gantry, [0.55, 0.65, spanW], [0, gantryH - 0.25, 0], steelTrussMat);
  box(gantry, [0.35, 0.35, spanW], [0, gantryH - 1.2, 0], steelTrussMat);

  const sign1 = new THREE.Group();
  sign1.position.set(0, gantryH - 0.8, -3.2);
  box(sign1, [0.08, 1.8, 4.8], [0, 0, 0], highwayGreenMat);
  box(sign1, [0.09, 0.3, 4.6], [0, 0.6, 0], highwayTextMat);
  box(sign1, [0.09, 0.25, 4.2], [0, 0.15, 0], highwayTextMat);
  box(sign1, [0.09, 0.25, 3.8], [0, -0.3, 0], highwayYellowMat);
  box(sign1, [0.1, 0.4, 0.6], [0, -0.65, 1.6], highwayTextMat);
  gantry.add(sign1);

  const sign2 = new THREE.Group();
  sign2.position.set(0, gantryH - 0.8, 3.2);
  box(sign2, [0.08, 1.8, 4.8], [0, 0, 0], highwayGreenMat);
  box(sign2, [0.09, 0.3, 4.6], [0, 0.6, 0], highwayTextMat);
  box(sign2, [0.09, 0.25, 4.2], [0, 0.15, 0], highwayTextMat);
  box(sign2, [0.09, 0.25, 3.8], [0, -0.3, 0], highwayYellowMat);
  box(sign2, [0.1, 0.4, 0.6], [0, -0.65, -1.6], highwayTextMat);
  gantry.add(sign2);

  for (const s of [-3.5, 0, 3.5]) {
    box(gantry, [0.8, 0.15, 0.3], [0.3, gantryH - 1.75, s], steelTrussMat);
    box(gantry, [0.6, 0.05, 0.2], [0.3, gantryH - 1.85, s], windowWarm);
  }

  skywayGroup.add(gantry);
  movingWorld.push({ group: gantry, lowerBound: -280, wrapSpan: 560 });
}

makeSkywayGantry(-140);
makeSkywayGantry(0);
makeSkywayGantry(140);

// ─── ROUTE 2: BROOKLYN BRIDGE RUN (y = 24.5) ───────────────────────────────────
const bridgeRouteGroup = new THREE.Group();
scene.add(bridgeRouteGroup);

function buildBridgeRoute() {
  const bridge = new THREE.Group();
  const deckY = 24.5;
  const length = 720;
  const width = 14.6;

  // 1. Underdeck Floorbeams & Transverse Cross-Steel Truss
  box(bridge, [length, 1.2, width], [0, deckY - 0.6, 0], steelTrussMat);

  // 2. Dual Roadways (Asphalt)
  for (const s of [-1, 1]) {
    const rZ = s * 3.4;
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(length, 4.4),
      new THREE.MeshStandardMaterial({ color: 0x484d54, roughness: 0.88, metalness: 0.12 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, deckY + 0.01, rZ);
    road.receiveShadow = true;
    bridge.add(road);

    box(bridge, [length, 0.02, 0.08], [0, deckY + 0.02, rZ - 2.0], roadEdgePaint);
    box(bridge, [length, 0.02, 0.08], [0, deckY + 0.02, rZ + 2.0], roadEdgePaint);

    for (let x = -350; x < 350; x += 24) {
      box(bridge, [0.35, 0.025, 4.4], [x, deckY + 0.02, rZ], steelTrussMat);
    }
  }

  // 3. Central Elevated Timber Boardwalk Promenade (z = 0)
  box(bridge, [length, 0.45, 2.2], [0, deckY + 0.35, 0], woodBoardwalkMat);
  for (const s of [-1, 1]) {
    box(bridge, [length, 0.04, 0.04], [0, deckY + 1.15, s * 1.1], ironRailingMat);
    box(bridge, [length, 0.04, 0.04], [0, deckY + 0.72, s * 1.1], ironRailingMat);
    box(bridge, [length, 0.04, 0.04], [0, deckY + 0.35, s * 1.1], ironRailingMat);
  }

  // 4. Stiffening Pratt Lattice Steel Trusses along outer edges
  for (const s of [-1, 1]) {
    const tZ = s * (width / 2 - 0.25);
    box(bridge, [length, 3.8, 0.35], [0, deckY + 1.9, tZ], steelTrussMat);
    box(bridge, [length, 0.35, 0.55], [0, deckY + 3.8, tZ], steelTrussMat);
  }

  return bridge;
}
bridgeRouteGroup.add(buildBridgeRoute());

// ─── Drivable Brooklyn Bridge Gothic Suspension Span (Unified Superstructure) ──
function buildDrivableBridgeSpan() {
  const span = new THREE.Group();
  const towerW = 16.8;
  const towerD = 10.5;
  const deckY  = 24.5;
  const portalH = 9.2;
  const archW = 4.4;

  function addGothicTower(xPos) {
    const tower = new THREE.Group();
    tower.position.set(xPos, 0, 0);

    box(tower, [towerD, deckY, towerW], [0, deckY / 2, 0], bridgeStoneDark);
    box(tower, [towerD * 1.05, 1.2, towerW * 1.05], [0, deckY + 0.6, 0], bridgeStoneLight);

    box(tower, [towerD * 0.9, portalH, 2.2], [0, deckY + portalH / 2, 0], bridgeStoneMat);
    box(tower, [towerD * 0.9, portalH, 2.6], [0, deckY + portalH / 2, -towerW / 2 + 1.3], bridgeStoneMat);
    box(tower, [towerD * 0.9, portalH, 2.6], [0, deckY + portalH / 2,  towerW / 2 - 1.3], bridgeStoneMat);

    for (const s of [-1, 1]) {
      const archZ = s * 3.4;
      box(tower, [towerD * 0.92, 1.2, archW * 0.65], [0, deckY + portalH - 0.4, archZ - 0.7], bridgeStoneLight, { rotation: [0.22, 0, 0] });
      box(tower, [towerD * 0.92, 1.2, archW * 0.65], [0, deckY + portalH - 0.4, archZ + 0.7], bridgeStoneLight, { rotation: [-0.22, 0, 0] });
      box(tower, [towerD * 0.95, 2.2, 1.2], [0, deckY + portalH + 0.8, archZ], bridgeStoneLight);
    }

    box(tower, [towerD * 1.06, 2.4, towerW * 1.06], [0, deckY + portalH + 2.4, 0], bridgeStoneLight);

    const atticH = 15.0;
    const atticY = deckY + portalH + 3.6;
    box(tower, [towerD * 0.88, atticH, towerW * 0.88], [0, atticY + atticH / 2, 0], bridgeStoneMat);
    box(tower, [towerD * 0.94, 1.5, towerW * 0.94], [0, atticY + atticH + 0.75, 0], bridgeStoneLight);

    box(tower, [3.2, 4.5, 3.2], [0, atticY + atticH + 3.0, -towerW * 0.36], bridgeStoneLight);
    box(tower, [3.2, 4.5, 3.2], [0, atticY + atticH + 3.0,  towerW * 0.36], bridgeStoneLight);
    box(tower, [4.0, 5.8, 4.0], [0, atticY + atticH + 3.6, 0], bridgeStoneLight);

    for (const s of [-1, 1]) {
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ee77, emissiveIntensity: 3.5 })
      );
      lamp.position.set(towerD * 0.46, deckY + portalH + 1.2, s * 4.8);
      tower.add(lamp);
    }

    span.add(tower);
  }

  addGothicTower(-140);
  addGothicTower(140);

  // Main Catenary Suspension Cables & Radiant Emerald Necklace Lights connected between the towers
  for (const s of [-1, 1]) {
    const cZ = s * 7.1;
    for (let x = -280; x <= 280; x += 12) {
      let cy;
      if (Math.abs(x) <= 140) {
        const u = x / 140;
        cy = 26.5 + (u * u) * 27.5;
      } else {
        const u = (Math.abs(x) - 140) / 140;
        cy = 54.0 - u * 27.0;
      }

      box(span, [12.2, 0.18, 0.18], [x, cy, cZ], cableSteelMat);

      const lightJewel = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ee77, emissiveIntensity: 3.2 })
      );
      lightJewel.position.set(x, cy - 0.25, cZ);
      span.add(lightJewel);

      if (cy > 27.2) {
        box(span, [0.06, cy - 25.0, 0.06], [x, (cy + 25.0) / 2, cZ], cableSteelMat);
      }
    }
  }

  return span;
}

const bridgeSuperstructure = buildDrivableBridgeSpan();
bridgeRouteGroup.add(bridgeSuperstructure);
movingWorld.push({ group: bridgeSuperstructure, lowerBound: -280, wrapSpan: 560 });
bridgeRouteGroup.visible = false;

// ─── ROUTE 3: METROPOLIS SKYSCRAPER CANYON (y = 0, z = 0) ───────────────────────
const canyonRouteGroup = new THREE.Group();
scene.add(canyonRouteGroup);
canyonRouteGroup.visible = false;

const neonCyanMat    = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00d4ff, emissiveIntensity: 3.5 });
const neonMagentaMat = new THREE.MeshStandardMaterial({ color: 0xff007f, emissive: 0xee0066, emissiveIntensity: 3.5 });
const neonGreenMat   = new THREE.MeshStandardMaterial({ color: 0x39ff14, emissive: 0x28dd0f, emissiveIntensity: 3.5 });
const neonGoldMat    = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff8800, emissiveIntensity: 3.2 });

// Overhead Skyscraper Skybridges & Neon Blades (Spans across the canyon at z = 0)
function makeCanyonSkybridge(x, y, style) {
  const sb = new THREE.Group();
  sb.position.set(x, y, 0);
  const span = 16.0;

  if (style === 1) {
    box(sb, [4.8, 0.45, span], [0, 0, 0], steelTrussMat);
    box(sb, [4.8, 0.45, span], [0, 3.6, 0], steelTrussMat);
    box(sb, [4.6, 3.1, span - 0.4], [0, 1.8, 0], windowWarm);
    box(sb, [5.0, 0.15, span + 0.2], [0, 3.8, 0], neonCyanMat);
    box(sb, [5.0, 0.15, span + 0.2], [0, -0.2, 0], neonCyanMat);
  } else {
    box(sb, [5.6, 4.4, span], [0, 2.2, 0], fdrConcreteMat);
    box(sb, [5.2, 3.4, span - 0.6], [0, 2.2, 0], facadeGlass);
    box(sb, [5.8, 0.25, span + 0.4], [0, 0.3, 0], neonMagentaMat);
    box(sb, [5.8, 0.25, span + 0.4], [0, 4.2, 0], neonMagentaMat);
  }

  const bladeSign1 = new THREE.Group();
  bladeSign1.position.set(0, -y + 16, -7.5);
  box(bladeSign1, [0.35, 14.0, 0.8], [0, 0, 0], steelTrussMat);
  box(bladeSign1, [0.45, 12.8, 0.35], [0, 0, 0.3], style === 1 ? neonCyanMat : neonGreenMat);
  sb.add(bladeSign1);

  const bladeSign2 = new THREE.Group();
  bladeSign2.position.set(0, -y + 18, 7.5);
  box(bladeSign2, [0.35, 16.0, 0.8], [0, 0, 0], steelTrussMat);
  box(bladeSign2, [0.45, 14.8, 0.35], [0, 0, -0.3], style === 1 ? neonMagentaMat : neonGoldMat);
  sb.add(bladeSign2);

  canyonRouteGroup.add(sb);
  movingWorld.push({ group: sb, lowerBound: -280, wrapSpan: 560 });
}

makeCanyonSkybridge(-160, 12.0, 1);
makeCanyonSkybridge(-50,  17.5, 2);
makeCanyonSkybridge(60,   12.5, 1);
makeCanyonSkybridge(170,  18.0, 2);

// ─── Walking Persons (Matching Reference Guy with Articulated Legs) ───────────
const walkerData = [];

const personSkinMat     = new THREE.MeshStandardMaterial({ color: 0xd4956a, roughness: 0.72, metalness: 0 });
const personHairMat     = new THREE.MeshStandardMaterial({ color: 0x3d1f0a, roughness: 0.88, metalness: 0 });
const personBeardMat    = new THREE.MeshStandardMaterial({ color: 0x1a0d04, roughness: 0.9,  metalness: 0 });
const personEyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f7fb, roughness: 0.25, metalness: 0 });
const personEyePupilMat = new THREE.MeshStandardMaterial({ color: 0x18100c, roughness: 0.2,  metalness: 0 });
const personShirtMat    = new THREE.MeshStandardMaterial({ color: 0x8db8cc, roughness: 0.78, metalness: 0.02 });
const personShirtDark   = new THREE.MeshStandardMaterial({ color: 0x6a9bae, roughness: 0.80, metalness: 0.02 });
const personCollarMat   = new THREE.MeshStandardMaterial({ color: 0x9ec4d6, roughness: 0.76, metalness: 0.02 });
const personBeltMat     = new THREE.MeshStandardMaterial({ color: 0x5c2d0a, roughness: 0.70, metalness: 0.08 });
const personBuckleMat   = new THREE.MeshStandardMaterial({ color: 0x8a7050, roughness: 0.45, metalness: 0.65 });
const personJeansMat    = new THREE.MeshStandardMaterial({ color: 0x2e4a6e, roughness: 0.82, metalness: 0.02 });
const personBootMat     = new THREE.MeshStandardMaterial({ color: 0x6b3415, roughness: 0.74, metalness: 0.06 });
const personBootSole    = new THREE.MeshStandardMaterial({ color: 0x3a1c08, roughness: 0.88, metalness: 0.02 });
const personButtonMat   = new THREE.MeshStandardMaterial({ color: 0x7daabb, roughness: 0.5,  metalness: 0.3 });

const HIP_Y = 0.84;

function makeLeg(xOffset) {
  const hip = new THREE.Group();
  hip.position.set(xOffset, HIP_Y, 0);

  const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.060, 0.24, 3, 8), personJeansMat);
  thigh.position.y = -0.18;
  thigh.castShadow = true;
  hip.add(thigh);

  const knee = new THREE.Group();
  knee.position.set(0, -0.36, 0);
  hip.add(knee);

  const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.24, 3, 8), personJeansMat);
  shin.position.y = -0.17;
  shin.castShadow = true;
  knee.add(shin);

  const bootUpper = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.095, 0.175), personBootMat);
  bootUpper.position.set(0, -0.34, 0.012);
  bootUpper.castShadow = true;
  knee.add(bootUpper);

  const toeCap = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), personBootMat);
  toeCap.scale.set(0.056, 0.044, 0.075);
  toeCap.position.set(0, -0.34, 0.086);
  knee.add(toeCap);

  const heel = new THREE.Mesh(new THREE.BoxGeometry(0.100, 0.038, 0.060), personBootMat);
  heel.position.set(0, -0.378, -0.065);
  knee.add(heel);

  const sole = new THREE.Mesh(new THREE.BoxGeometry(0.118, 0.028, 0.198), personBootSole);
  sole.position.set(0, -0.392, 0.012);
  sole.receiveShadow = true;
  knee.add(sole);

  return { hip, knee };
}

function makeArm(xOffset) {
  const shoulder = new THREE.Group();
  shoulder.position.set(xOffset, 1.465, 0);

  const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.13, 3, 6), personShirtMat);
  sleeve.position.y = -0.075;
  sleeve.castShadow = true;
  shoulder.add(sleeve);

  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.025, 8), personShirtDark);
  cuff.position.y = -0.150;
  shoulder.add(cuff);

  const elbow = new THREE.Group();
  elbow.position.set(0, -0.155, 0);
  elbow.rotation.x = 0.22;
  shoulder.add(elbow);

  const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.18, 3, 6), personSkinMat);
  forearm.position.y = -0.120;
  forearm.castShadow = true;
  elbow.add(forearm);

  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.040, 7, 6), personSkinMat);
  hand.scale.set(1, 0.75, 0.65);
  hand.position.y = -0.235;
  elbow.add(hand);

  return shoulder;
}

function makePerson() {
  const group = new THREE.Group();

  const leftLegData  = makeLeg(-0.09);
  const rightLegData = makeLeg( 0.09);
  group.add(leftLegData.hip);
  group.add(rightLegData.hip);

  const hipBlock = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.21), personJeansMat);
  hipBlock.position.y = HIP_Y + 0.07;
  hipBlock.castShadow = true;
  group.add(hipBlock);

  // Cartoon Head & Face
  const face = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 14), personSkinMat);
  face.scale.set(0.138, 0.148, 0.132);
  face.position.y = 1.735;
  face.castShadow = true;
  group.add(face);

  for (const sx of [-1, 1]) {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), personEyeWhiteMat);
    eyeWhite.scale.set(0.024, 0.032, 0.012);
    eyeWhite.position.set(sx * 0.046, 1.745, 0.126);
    group.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 6), personEyePupilMat);
    pupil.scale.set(0.014, 0.018, 0.010);
    pupil.position.set(sx * 0.046, 1.745, 0.134);
    group.add(pupil);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.004, 4, 4), personEyeWhiteMat);
    glint.position.set(sx * 0.043, 1.752, 0.140);
    group.add(glint);

    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.012, 0.014), personHairMat);
    brow.position.set(sx * 0.052, 1.785, 0.124);
    brow.rotation.z = -sx * 0.14;
    group.add(brow);

    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 5), personSkinMat);
    ear.position.set(sx * 0.138, 1.73, 0);
    group.add(ear);
  }

  const nose = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), personSkinMat);
  nose.scale.set(0.018, 0.022, 0.020);
  nose.position.set(0, 1.716, 0.138);
  group.add(nose);

  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.19), personHairMat);
  hairTop.position.set(0.01, 1.875, -0.01);
  hairTop.rotation.z = -0.08;
  hairTop.castShadow = true;
  group.add(hairTop);

  const hairFront = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.055, 0.1), personHairMat);
  hairFront.position.set(0.02, 1.865, 0.1);
  hairFront.rotation.x = -0.3;
  group.add(hairFront);

  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.08), personHairMat);
  hairBack.position.set(0, 1.845, -0.1);
  group.add(hairBack);

  const beard = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.075, 0.04), personBeardMat);
  beard.position.set(0, 1.655, 0.115);
  beard.rotation.x = -0.15;
  group.add(beard);

  const moustache = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.022, 0.03), personBeardMat);
  moustache.position.set(0, 1.698, 0.122);
  group.add(moustache);

  for (const sx of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.055, 0.03), personBeardMat);
    cheek.position.set(sx * 0.07, 1.665, 0.108);
    group.add(cheek);
  }

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.062, 0.11, 8), personSkinMat);
  neck.position.y = 1.6;
  group.add(neck);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.46, 0.22), personShirtMat);
  torso.position.y = 1.28;
  torso.castShadow = true;
  group.add(torso);

  const placket = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.42, 0.012), personShirtDark);
  placket.position.set(0, 1.29, 0.116);
  group.add(placket);

  for (let b = 0; b < 5; b++) {
    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.012, 5, 4), personButtonMat);
    btn.position.set(0, 1.46 - b * 0.09, 0.122);
    group.add(btn);
  }

  for (const sx of [-1, 1]) {
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.065, 0.014), personCollarMat);
    collar.position.set(sx * 0.055, 1.52, 0.108);
    collar.rotation.z = sx * 0.35;
    collar.rotation.x = -0.2;
    group.add(collar);
  }

  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.038, 0.225), personBeltMat);
  belt.position.y = 1.045;
  group.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.04, 0.016), personBuckleMat);
  buckle.position.set(0, 1.045, 0.117);
  group.add(buckle);

  const leftArm  = makeArm(-0.185);
  const rightArm = makeArm( 0.185);
  group.add(leftArm);
  group.add(rightArm);

  return {
    group,
    leftArm,
    rightArm,
    leftHip:   leftLegData.hip,
    leftKnee:  leftLegData.knee,
    rightHip:  rightLegData.hip,
    rightKnee: rightLegData.knee,
  };
}

const walkerLanes = [
  { z: -8.4 },
  { z: -9.1 },
  { z: -7.7 },
  { z:  7.6 },
  { z:  7.9 },
  { z:  8.6 },
];

// Skin tone, hair color, shirt color palette for pedestrian variety
const skinPalette  = [0xd4956a, 0xc07844, 0x8b5e3c, 0xf5c99e, 0xe8a87c, 0xaa6d3c];
const hairPalette  = [0x3d1f0a, 0x1a0a04, 0x888888, 0xf5b942, 0xc25b2a, 0x2c1810];
const shirtPalette = [0x8db8cc, 0xcc5555, 0x558855, 0xb88830, 0x8855cc, 0x444488, 0xdd8844, 0x446688];

// makePerson accepts optional material overrides for variety
function makePersonVariant(skinColor, hairColor, shirtColor) {
  const sm   = new THREE.MeshStandardMaterial({ color: skinColor,  roughness: 0.72, metalness: 0 });
  const hm   = new THREE.MeshStandardMaterial({ color: hairColor,  roughness: 0.88, metalness: 0 });
  const bm   = new THREE.MeshStandardMaterial({ color: hairColor,  roughness: 0.9,  metalness: 0 });
  const shm  = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.78, metalness: 0.02 });
  const shd  = new THREE.MeshStandardMaterial({ color: new THREE.Color(shirtColor).multiplyScalar(0.75), roughness: 0.80, metalness: 0.02 });
  const colm = new THREE.MeshStandardMaterial({ color: new THREE.Color(shirtColor).multiplyScalar(1.1),  roughness: 0.76, metalness: 0.02 });

  const group = new THREE.Group();

  // ── Legs (using clone of jeans, skin for boot) ──
  function makeVLeg(xOffset) {
    const hip = new THREE.Group();
    hip.position.set(xOffset, HIP_Y, 0);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.060, 0.24, 3, 8), personJeansMat);
    thigh.position.y = -0.18; thigh.castShadow = true;
    hip.add(thigh);
    const knee = new THREE.Group();
    knee.position.set(0, -0.36, 0);
    hip.add(knee);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.24, 3, 8), personJeansMat);
    shin.position.y = -0.17; shin.castShadow = true;
    knee.add(shin);
    const bootUpper = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.095, 0.175), personBootMat);
    bootUpper.position.set(0, -0.34, 0.012); bootUpper.castShadow = true;
    knee.add(bootUpper);
    const toeCap = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), personBootMat);
    toeCap.scale.set(0.056, 0.044, 0.075); toeCap.position.set(0, -0.34, 0.086);
    knee.add(toeCap);
    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.100, 0.038, 0.060), personBootMat);
    heel.position.set(0, -0.378, -0.065);
    knee.add(heel);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.118, 0.028, 0.198), personBootSole);
    sole.position.set(0, -0.392, 0.012); sole.receiveShadow = true;
    knee.add(sole);
    return { hip, knee };
  }

  const leftLegData  = makeVLeg(-0.09);
  const rightLegData = makeVLeg( 0.09);
  group.add(leftLegData.hip);
  group.add(rightLegData.hip);

  const hipBlock = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.21), personJeansMat);
  hipBlock.position.y = HIP_Y + 0.07; hipBlock.castShadow = true;
  group.add(hipBlock);

  // ── Arms ──
  function makeVArm(xOffset) {
    const shoulder = new THREE.Group();
    shoulder.position.set(xOffset, 1.465, 0);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.13, 3, 6), shm);
    sleeve.position.y = -0.075; sleeve.castShadow = true;
    shoulder.add(sleeve);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.025, 8), shd);
    cuff.position.y = -0.150;
    shoulder.add(cuff);
    const elbow = new THREE.Group();
    elbow.position.set(0, -0.155, 0); elbow.rotation.x = 0.22;
    shoulder.add(elbow);
    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.18, 3, 6), sm);
    forearm.position.y = -0.120; forearm.castShadow = true;
    elbow.add(forearm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.040, 7, 6), sm);
    hand.scale.set(1, 0.75, 0.65); hand.position.y = -0.235;
    elbow.add(hand);
    return shoulder;
  }

  // ── Head ──
  const face = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 14), sm);
  face.scale.set(0.138, 0.148, 0.132); face.position.y = 1.735; face.castShadow = true;
  group.add(face);

  for (const sx of [-1, 1]) {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), personEyeWhiteMat);
    eyeWhite.scale.set(0.024, 0.032, 0.012); eyeWhite.position.set(sx * 0.046, 1.745, 0.126);
    group.add(eyeWhite);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 6), personEyePupilMat);
    pupil.scale.set(0.014, 0.018, 0.010); pupil.position.set(sx * 0.046, 1.745, 0.134);
    group.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.004, 4, 4), personEyeWhiteMat);
    glint.position.set(sx * 0.043, 1.752, 0.140);
    group.add(glint);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.012, 0.014), hm);
    brow.position.set(sx * 0.052, 1.785, 0.124); brow.rotation.z = -sx * 0.14;
    group.add(brow);
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 5), sm);
    ear.position.set(sx * 0.138, 1.73, 0);
    group.add(ear);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), sm);
  nose.scale.set(0.018, 0.022, 0.020); nose.position.set(0, 1.716, 0.138);
  group.add(nose);
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.19), hm);
  hairTop.position.set(0.01, 1.875, -0.01); hairTop.rotation.z = -0.08; hairTop.castShadow = true;
  group.add(hairTop);
  const hairFront = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.055, 0.1), hm);
  hairFront.position.set(0.02, 1.865, 0.1); hairFront.rotation.x = -0.3;
  group.add(hairFront);
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.08), hm);
  hairBack.position.set(0, 1.845, -0.1);
  group.add(hairBack);
  const beard = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.075, 0.04), bm);
  beard.position.set(0, 1.655, 0.115); beard.rotation.x = -0.15;
  group.add(beard);
  const moustache = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.022, 0.03), bm);
  moustache.position.set(0, 1.698, 0.122);
  group.add(moustache);
  for (const sx of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.055, 0.03), bm);
    cheek.position.set(sx * 0.07, 1.665, 0.108);
    group.add(cheek);
  }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.062, 0.11, 8), sm);
  neck.position.y = 1.6;
  group.add(neck);

  // ── Torso ──
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.46, 0.22), shm);
  torso.position.y = 1.28; torso.castShadow = true;
  group.add(torso);
  const placket = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.42, 0.012), shd);
  placket.position.set(0, 1.29, 0.116);
  group.add(placket);
  for (let b = 0; b < 5; b++) {
    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.012, 5, 4), personButtonMat);
    btn.position.set(0, 1.46 - b * 0.09, 0.122);
    group.add(btn);
  }
  for (const sx of [-1, 1]) {
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.065, 0.014), colm);
    collar.position.set(sx * 0.055, 1.52, 0.108);
    collar.rotation.z = sx * 0.35; collar.rotation.x = -0.2;
    group.add(collar);
  }
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.038, 0.225), personBeltMat);
  belt.position.y = 1.045;
  group.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.04, 0.016), personBuckleMat);
  buckle.position.set(0, 1.045, 0.117);
  group.add(buckle);

  const leftArm  = makeVArm(-0.185);
  const rightArm = makeVArm( 0.185);
  group.add(leftArm);
  group.add(rightArm);

  return {
    group,
    leftArm,
    rightArm,
    leftHip:   leftLegData.hip,
    leftKnee:  leftLegData.knee,
    rightHip:  rightLegData.hip,
    rightKnee: rightLegData.knee,
  };
}

for (let i = 0; i < 42; i++) {
  const lane = walkerLanes[i % walkerLanes.length];
  const skinColor  = skinPalette[Math.floor(seeded(i * 7) * skinPalette.length)];
  const hairColor  = hairPalette[Math.floor(seeded(i * 11) * hairPalette.length)];
  const shirtColor = shirtPalette[Math.floor(seeded(i * 13) * shirtPalette.length)];
  const person = makePersonVariant(skinColor, hairColor, shirtColor);
  const startX = -195 + i * 10;
  const scale = 0.88 + seeded(i * 17) * 0.24;
  person.group.scale.setScalar(scale);
  person.group.position.set(startX, 0.045, lane.z);
  const walkDir = lane.z > 0 ? 1 : -1;
  person.group.rotation.y = walkDir > 0 ? Math.PI : 0;
  scene.add(person.group);

  const walkSpeed = 0.8 + seeded(i * 5) * 0.7;
  const phaseOffset = seeded(i * 3) * Math.PI * 2;

  walkerData.push({
    group: person.group,
    leftArm: person.leftArm,
    rightArm: person.rightArm,
    leftHip: person.leftHip,
    leftKnee: person.leftKnee,
    rightHip: person.rightHip,
    rightKnee: person.rightKnee,
    walkSpeed,
    phaseOffset,
    walkDir,
    baseZ: lane.z,
    lowerBound: -220,
    wrapSpan: 440,
  });
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function makeStarfield() {
  const starCount = 2400;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  const palette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xf6f9ff),
    new THREE.Color(0xffeedd),
    new THREE.Color(0xffdfb8),
    new THREE.Color(0xbfe0ff),
    new THREE.Color(0x99ccff),
  ];

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(0.04 + Math.random() * 0.94);
    const r = 180 + Math.random() * 70;

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) + 2;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  function makeStarTexture() {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    g.addColorStop(0.12, 'rgba(240, 248, 255, 0.9)');
    g.addColorStop(0.35, 'rgba(200, 225, 255, 0.35)');
    g.addColorStop(0.7, 'rgba(160, 200, 255, 0.08)');
    g.addColorStop(1, 'rgba(140, 180, 255, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    map: makeStarTexture(),
    size: 2.8,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });

  const stars = new THREE.Points(geom, mat);
  stars.renderOrder = -2;
  scene.add(stars);
  return stars;
}
const starfield = makeStarfield();

// ─── Moon ─────────────────────────────────────────────────────────────────────
function makeMoonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const baseGrad = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
  baseGrad.addColorStop(0, '#f8fafc');
  baseGrad.addColorStop(0.68, '#e2e8f0');
  baseGrad.addColorStop(0.88, '#cbd5e1');
  baseGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 512, 512);

  const mariaData = [
    { x: 190, y: 180, rx: 75, ry: 60, rot: 0.2 },
    { x: 310, y: 200, rx: 65, ry: 75, rot: -0.3 },
    { x: 260, y: 290, rx: 90, ry: 55, rot: 0.4 },
    { x: 150, y: 280, rx: 60, ry: 80, rot: -0.2 },
    { x: 340, y: 320, rx: 50, ry: 45, rot: 0.1 },
    { x: 230, y: 130, rx: 45, ry: 35, rot: 0.5 },
    { x: 380, y: 240, rx: 35, ry: 50, rot: -0.1 },
  ];

  for (const m of mariaData) {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.rot);
    const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, Math.max(m.rx, m.ry));
    grad.addColorStop(0, 'rgba(100, 116, 139, 0.52)');
    grad.addColorStop(0.5, 'rgba(100, 116, 139, 0.32)');
    grad.addColorStop(0.85, 'rgba(148, 163, 184, 0.14)');
    grad.addColorStop(1, 'rgba(148, 163, 184, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, m.rx, m.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const craters = [
    { x: 260, y: 390, r: 24, rays: true },
    { x: 160, y: 160, r: 18, rays: false },
    { x: 340, y: 170, r: 15, rays: false },
    { x: 190, y: 340, r: 14, rays: false },
    { x: 380, y: 280, r: 12, rays: false },
    { x: 290, y: 120, r: 16, rays: false },
  ];

  for (const c of craters) {
    if (c.rays) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      for (let a = 0; a < 14; a++) {
        const ang = (a / 14) * Math.PI * 2 + 0.1;
        ctx.beginPath();
        ctx.moveTo(c.x + Math.cos(ang) * (c.r + 4), c.y + Math.sin(ang) * (c.r + 4));
        ctx.lineTo(c.x + Math.cos(ang) * (c.r + 75 + (a % 3) * 30), c.y + Math.sin(ang) * (c.r + 75 + (a % 3) * 30));
        ctx.stroke();
      }
    }
    ctx.fillStyle = 'rgba(71, 85, 105, 0.42)';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, Math.PI * 0.7, Math.PI * 1.8);
    ctx.stroke();
  }

  for (let i = 0; i < 3000; i++) {
    const nx = Math.random() * 512;
    const ny = Math.random() * 512;
    const bright = Math.random() > 0.5 ? 255 : 80;
    ctx.fillStyle = `rgba(${bright}, ${bright}, ${bright}, ${0.03 + Math.random() * 0.08})`;
    ctx.fillRect(nx, ny, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeMoon() {
  const moonGroup = new THREE.Group();
  moonGroup.position.set(38, 58, -25);

  const moonTex = makeMoonTexture();
  const moonMat = new THREE.MeshBasicMaterial({
    map: moonTex,
    color: 0xffffff,
    fog: false,
  });

  const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(6.4, 32, 28), moonMat);
  moonGroup.add(moonMesh);

  function makeMoonHaloTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 12, 128, 128, 128);
    g.addColorStop(0, 'rgba(235, 245, 255, 0.85)');
    g.addColorStop(0.2, 'rgba(200, 225, 255, 0.45)');
    g.addColorStop(0.5, 'rgba(160, 200, 255, 0.16)');
    g.addColorStop(0.8, 'rgba(120, 160, 230, 0.05)');
    g.addColorStop(1, 'rgba(100, 140, 220, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  const haloMat = new THREE.SpriteMaterial({
    map: makeMoonHaloTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });

  const innerHalo = new THREE.Sprite(haloMat);
  innerHalo.scale.set(25, 25, 1);
  moonGroup.add(innerHalo);

  const outerHaloMat = haloMat.clone();
  outerHaloMat.opacity = 0.45;
  const outerHalo = new THREE.Sprite(outerHaloMat);
  outerHalo.scale.set(54, 54, 1);
  moonGroup.add(outerHalo);

  scene.add(moonGroup);
  return moonGroup;
}
const moon = makeMoon();

// ─── Headlamps Spotlights ─────────────────────────────────────────────────────
const headlightTargets = [];
for (const side of [-1, 1]) {
  const target = new THREE.Object3D();
  target.position.set(22, 0.12, car.position.z + side * 0.65);
  scene.add(target);
  const beam = new THREE.SpotLight(0xdbeaff, 72, 38, Math.PI / 8, 0.68, 1.4);
  beam.position.set(2.38, 0.88, car.position.z + side * 0.65);
  beam.target = target;
  beam.castShadow = false;
  scene.add(beam);
  headlightTargets.push({ beam, target, side });
}

// ─── Input & Dynamic State ───────────────────────────────────────────────────
const speedDisplay = document.getElementById('speed');
let speed = 21.7;
let driveDistance = 0;
let previousFrame = 0;

let targetSteer = 0;
let steerAngle = 0;
let lateralVelocity = 0;
let throttleInput = 0;
let brakeInput = 0;
const keysDown = new Set();

function setSteeringFromKeys(event, pressed) {
  const key = event.key.toLowerCase();
  if (pressed) keysDown.add(key);
  else keysDown.delete(key);

  if (['arrowleft', 'a', 'arrowright', 'd', 'arrowup', 'w', 'arrowdown', 's', 'c', 'r'].includes(key)) {
    event.preventDefault();
  }
  if (pressed && key === 'c') {
    setActiveCar((activeCarIndex + 1) % CAR_CATALOG.length);
  }
  if (pressed && key === 'r') {
    setActiveRoute((activeRouteIndex + 1) % ROUTES.length);
  }

  const left = keysDown.has('arrowleft') || keysDown.has('a');
  const right = keysDown.has('arrowright') || keysDown.has('d');
  targetSteer = left && !right ? -1 : right && !left ? 1 : 0;
}
window.addEventListener('keydown', (event) => setSteeringFromKeys(event, true));
window.addEventListener('keyup', (event) => setSteeringFromKeys(event, false));

document.querySelectorAll('.car-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    setActiveCar(Number(btn.dataset.car));
  });
});

document.querySelectorAll('.route-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    setActiveRoute(Number(btn.dataset.route));
  });
});

// ─── Touch Driving Controls (Mobile & Tablet) ─────────────────────────────────
function updateTouchSteering() {
  const left = keysDown.has('arrowleft') || keysDown.has('a');
  const right = keysDown.has('arrowright') || keysDown.has('d');
  targetSteer = left && !right ? -1 : right && !left ? 1 : 0;
}

function bindTouchButton(id, key) {
  const btn = document.getElementById(id);
  if (!btn) return;

  const onDown = (e) => {
    e.preventDefault();
    keysDown.add(key);
    btn.classList.add('active-touch');
    updateTouchSteering();
  };

  const onUp = (e) => {
    e.preventDefault();
    keysDown.delete(key);
    btn.classList.remove('active-touch');
    updateTouchSteering();
  };

  btn.addEventListener('pointerdown', onDown);
  btn.addEventListener('pointerup', onUp);
  btn.addEventListener('pointerleave', onUp);
  btn.addEventListener('pointercancel', onUp);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}

bindTouchButton('btn-left', 'a');
bindTouchButton('btn-right', 'd');
bindTouchButton('btn-gas', 'w');
bindTouchButton('btn-brake', 's');

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener('resize', resize);

// ─── Animation Loop ───────────────────────────────────────────────────────────
renderer.setAnimationLoop((time) => {
  const delta = previousFrame === 0 ? 0.016 : Math.min((time - previousFrame) / 1000, 0.05);
  previousFrame = time;
  const t = time * 0.001;

  // 1. Vehicle Driving Dynamics & Smooth Progressive Pedals
  const braking = keysDown.has('arrowdown') || keysDown.has('s');
  const accelerating = keysDown.has('arrowup') || keysDown.has('w');

  const targetThrottle = accelerating ? 1.0 : 0.0;
  const targetBrake = braking ? 1.0 : 0.0;
  throttleInput += (targetThrottle - throttleInput) * Math.min(1.0, 7.0 * delta);
  brakeInput += (targetBrake - brakeInput) * Math.min(1.0, 8.5 * delta);

  if (brakeInput > 0.01) {
    speed = Math.max(0, speed - brakeInput * 28.0 * delta);
  } else if (throttleInput > 0.01) {
    speed = Math.min(48.0, speed + throttleInput * 15.0 * delta);
  } else {
    speed += (21.7 - speed) * Math.min(1.0, delta * 1.5);
  }

  driveDistance += speed * delta;

  // 2. Smooth Power Steering & Dynamic Tire Grip
  const steerRate = targetSteer !== 0 ? 5.8 : 7.8;
  steerAngle += (targetSteer - steerAngle) * Math.min(1.0, steerRate * delta);

  // Speed-sensitive steering ratio
  const speedFactor = 1.0 / (1.0 + Math.max(0, speed - 15) * 0.024);
  const effectiveSteer = steerAngle * speedFactor;

  // Viscous tire grip lateral velocity
  const maxLatSpeed = Math.min(speed * 0.135, 3.6);
  const targetLatVel = effectiveSteer * maxLatSpeed;
  lateralVelocity += (targetLatVel - lateralVelocity) * Math.min(1.0, 8.2 * delta);

  // 3. Multi-Route Transition (Elevation, Center Z, Pitch Slope)
  if (routeTransition < 1.0) {
    routeTransition = Math.min(1.0, routeTransition + delta * 0.75);
  }
  const s = routeTransition;
  const tCurve = s * s * s * (s * (s * 6 - 15) + 10);
  currentBaseY = THREE.MathUtils.lerp(fromRoute.baseY, toRoute.baseY, tCurve);
  currentCenterZ = THREE.MathUtils.lerp(fromRoute.centerZ, toRoute.centerZ, tCurve);
  const currentMinZ = THREE.MathUtils.lerp(fromRoute.minZ, toRoute.minZ, tCurve);
  const currentMaxZ = THREE.MathUtils.lerp(fromRoute.maxZ, toRoute.maxZ, tCurve);

  // Smoothly guide lateral position across routes
  if (routeTransition < 1.0 && Math.abs(toRoute.centerZ - fromRoute.centerZ) > 0.1) {
    const targetCarZ = currentCenterZ + (car.position.z - fromRoute.centerZ) * 0.5;
    const centerShift = (targetCarZ - car.position.z) * Math.min(1.0, delta * 3.5);
    car.position.z += centerShift;
    camera.position.z += centerShift;
    controls.target.z += centerShift;
  }

  // Smooth lateral movement within current route boundaries
  const oldZ = car.position.z;
  car.position.z = THREE.MathUtils.clamp(car.position.z + lateralVelocity * delta, currentMinZ, currentMaxZ);
  const lateralShift = car.position.z - oldZ;

  camera.position.z += lateralShift;
  controls.target.z += lateralShift;

  // Smooth elevation camera follow
  const defaultCamY = 2.65;
  const defaultControlsY = 0.9;
  const targetCamY = defaultCamY + currentBaseY;
  const targetControlsY = defaultControlsY + currentBaseY;
  camera.position.y += (targetCamY - camera.position.y) * Math.min(1.0, delta * 3.8);
  controls.target.y += (targetControlsY - controls.target.y) * Math.min(1.0, delta * 3.8);

  // Pitch tilt slope while climbing/descending ramps
  const targetPitchSlope = (toRoute.baseY - fromRoute.baseY) * Math.sin(s * Math.PI) * 0.038;
  currentPitchSlope += (targetPitchSlope - currentPitchSlope) * Math.min(1.0, delta * 8.0);

  // Player Suspension Spring-Damper Simulation (Hooke's Law + viscous damping)
  const kRoll = 145, dRoll = 11.5;
  const kPitch = 125, dPitch = 10.5;
  const kBounce = 160, dBounce = 12.0;
  const kYaw = 95, dYaw = 9.5;

  playerPhysics.rollVel -= lateralVelocity * delta * 4.6;
  if (brakeInput > 0.05) playerPhysics.pitchVel -= brakeInput * delta * 4.2;
  else if (throttleInput > 0.05) playerPhysics.pitchVel += throttleInput * delta * 2.6;

  playerPhysics.rollVel += (-kRoll * playerPhysics.roll - dRoll * playerPhysics.rollVel) * delta;
  playerPhysics.roll += playerPhysics.rollVel * delta;

  playerPhysics.pitchVel += (-kPitch * playerPhysics.pitch - dPitch * playerPhysics.pitchVel) * delta;
  playerPhysics.pitch += playerPhysics.pitchVel * delta;

  playerPhysics.bounceVel += (-kBounce * playerPhysics.bounceY - dBounce * playerPhysics.bounceVel) * delta;
  playerPhysics.bounceY += playerPhysics.bounceVel * delta;

  playerPhysics.yawVel += (-kYaw * playerPhysics.yawKick - dYaw * playerPhysics.yawVel) * delta;
  playerPhysics.yawKick += playerPhysics.yawVel * delta;

  playerPhysics.cooldown = Math.max(0, playerPhysics.cooldown - delta);

  // Apply dynamic suspension transforms to Player Car
  car.position.y = currentBaseY + (Math.sin(t * 9) * 0.006) + playerPhysics.bounceY;
  car.rotation.x = playerPhysics.pitch - currentPitchSlope;
  const chassisYaw = -effectiveSteer * 0.065 + (lateralVelocity / 3.8) * 0.022 + playerPhysics.yawKick;
  car.rotation.y = chassisYaw;
  car.rotation.z = Math.sin(t * 6) * 0.002 + playerPhysics.roll;

  // Player Wheels: smooth front steering pivot and rotation spin
  for (const wheel of activeWheels) {
    if (wheel.isFront) {
      wheel.pivot.rotation.y = -steerAngle * 0.36;
    }
    wheel.spin.rotation.z -= (speed * delta) / (wheel.radius || 0.45);
  }

  // Headlight spot target tracking with elevation
  const currentCar = playerCarData[activeCarIndex];
  for (const { beam, target, side } of headlightTargets) {
    beam.position.set(currentCar.headlightPos.x, currentCar.headlightPos.y + currentBaseY, car.position.z + side * currentCar.headlightPos.z);
    target.position.set(22, 0.12 + currentBaseY, car.position.z + side * currentCar.headlightPos.z);
  }

  // 2. Road Markings & Moving Environment Wrapping
  for (const marker of roadMarkings) {
    marker.position.x -= speed * delta;
    if (marker.position.x < -245) marker.position.x += 480;
  }

  for (const item of movingWorld) {
    item.group.position.x -= speed * delta;
    if (item.group.position.x < item.lowerBound) item.group.position.x += item.wrapSpan;
  }

  asphaltTexture.offset.x = (asphaltTexture.offset.x + (speed * delta) / 720) % 1;

  // 3. Dynamic Skyline & Waterfront Parallax Motion
  skywayGroup.visible = (activeRouteIndex === 1);
  bridgeRouteGroup.visible = (activeRouteIndex === 2);
  canyonRouteGroup.visible = (activeRouteIndex === 3);
  brooklynBridgeGroup.visible = (activeRouteIndex !== 2);
  brooklynBridgeGroup.position.x -= speed * 0.45 * delta;
  if (brooklynBridgeGroup.position.x < -360) brooklynBridgeGroup.position.x += 720;

  // FDR Highway moves with intermediate parallax
  fdrHighwayGroup.position.x -= speed * 0.38 * delta;
  if (fdrHighwayGroup.position.x < -180) fdrHighwayGroup.position.x += 360;

  // Distant Manhattan & modern metropolis skyline moves with deep background parallax
  manhattanSkylineGroup.position.x -= speed * 0.20 * delta;
  if (manhattanSkylineGroup.position.x < -220) manhattanSkylineGroup.position.x += 440;

  // 4. Ambient Road Traffic & Dynamic Collision / Bump Physics
  const defaultOffsets = [-3.1, -1.3, 1.3, 3.1, 2.1];
  const bridgeOffsets = [-3.8, -2.8, 2.8, 3.8, 3.3];
  const laneOffsets = (activeRouteIndex === 2) ? bridgeOffsets : defaultOffsets;
  for (let i = 0; i < trafficSlots.length; i++) {
    const slot = trafficSlots[i];
    if (!slot.currentRoot) continue;

    // Traffic lane elevation and centerZ adapts to active route
    const baseCenter = (activeRouteIndex === 2) ? 0.0 : currentCenterZ;
    const targetSlotZ = baseCenter + laneOffsets[i % laneOffsets.length];
    slot.laneZ += (targetSlotZ - slot.laneZ) * Math.min(1.0, delta * 2.8);

    const phys = slot.physics;

    // Dynamic brake light flares when braking or bumping
    if (slot.brakeSprites) {
      const bInt = 0.5 + phys.brakeIntensity * 2.5;
      const bScaleX = 0.75 + phys.brakeIntensity * 0.95;
      const bScaleY = 0.35 + phys.brakeIntensity * 0.45;
      for (const sp of slot.brakeSprites) {
        sp.material.opacity = bInt;
        sp.scale.set(bScaleX, bScaleY, 1);
      }
    }

    // AI lane recovery & dynamic swerving
    phys.swerveOffset += (0 - phys.swerveOffset) * Math.min(1, delta * 3.2);
    phys.brakeIntensity = Math.max(0, phys.brakeIntensity - delta * 2.2);

    let groundSpeed = slot.relSpeed;
    if (phys.brakeIntensity > 0.05) groundSpeed *= 0.65;

    const netSpeed = slot.dir < 0 ? (speed + groundSpeed) : (speed - groundSpeed);
    slot.currentRoot.position.x -= netSpeed * delta;

    if (slot.currentRoot.position.x < -140) slot.currentRoot.position.x += 280;
    if (slot.currentRoot.position.x > 140) slot.currentRoot.position.x -= 280;

    slot.currentRoot.position.z = slot.laneZ + phys.swerveOffset;

    // Traffic suspension simulation
    phys.rollVel += (-kRoll * phys.roll - dRoll * phys.rollVel) * delta;
    phys.roll += phys.rollVel * delta;

    phys.pitchVel += (-kPitch * phys.pitch - dPitch * phys.pitchVel) * delta;
    phys.pitch += phys.pitchVel * delta;

    phys.bounceVel += (-kBounce * phys.bounceY - dBounce * phys.bounceVel) * delta;
    phys.bounceY += phys.bounceVel * delta;

    phys.yawVel += (-kYaw * phys.yawKick - dYaw * phys.yawVel) * delta;
    phys.yawKick += phys.yawVel * delta;

    phys.cooldown = Math.max(0, phys.cooldown - delta);

    // Apply 3D suspension motion & route elevation to traffic car
    slot.currentRoot.position.y = currentBaseY + (Math.sin((t * 8) + slot.laneZ) * 0.005) + phys.bounceY;
    slot.currentRoot.rotation.x = phys.pitch;
    slot.currentRoot.rotation.y = (slot.dir < 0 ? Math.PI : 0) + phys.yawKick;
    slot.currentRoot.rotation.z = phys.roll;

    for (const w of slot.wheels) {
      w.spin.rotation.z -= (groundSpeed * delta) / (w.radius || 0.45);
    }
  }

  // Gather all vehicles for interaction and collision detection
  const vehicles = [
    { isPlayer: true, x: 0, y: car.position.y, z: car.position.z, length: 4.6, width: 1.95, phys: playerPhysics, dir: 1, speed: speed }
  ];
  for (const slot of trafficSlots) {
    if (slot.currentRoot) {
      vehicles.push({
        isPlayer: false,
        slot: slot,
        x: slot.currentRoot.position.x,
        y: slot.currentRoot.position.y,
        z: slot.currentRoot.position.z,
        length: 4.6,
        width: 1.95,
        phys: slot.physics,
        dir: slot.dir,
        speed: slot.relSpeed,
      });
    }
  }

  // Pairwise vehicle collision resolution & motion reaction
  for (let i = 0; i < vehicles.length; i++) {
    for (let j = i + 1; j < vehicles.length; j++) {
      const vA = vehicles[i];
      const vB = vehicles[j];

      const dx = vA.x - vB.x;
      const dz = vA.z - vB.z;
      const minDistX = (vA.length + vB.length) * 0.46; // ~4.2m
      const minDistZ = (vA.width + vB.width) * 0.46;   // ~1.8m

      const overlapX = minDistX - Math.abs(dx);
      const overlapZ = minDistZ - Math.abs(dz);

      if (overlapX > 0 && overlapZ > 0 && Math.abs(vA.y - vB.y) < 1.8) {
        // Collision / Bump detected!
        const relVel = Math.abs((vA.dir * vA.speed) - (vB.dir * vB.speed));
        const impactForce = THREE.MathUtils.clamp(relVel * 0.08 + 1.0, 1.0, 3.5);

        const contactX = (vA.x + vB.x) * 0.5;
        const contactZ = (vA.z + vB.z) * 0.5;
        const contactY = (vA.y + vB.y) * 0.5 + 0.55;

        // Side-swipe / Lateral bump
        if (overlapZ < overlapX) {
          const signZ = Math.sign(dz) || 1;
          const signX = Math.sign(dx) || 1;

          // Push apart in lateral Z to prevent interpenetration
          if (vA.isPlayer) {
            car.position.z += signZ * overlapZ * 0.55;
            camera.position.z += signZ * overlapZ * 0.55;
            controls.target.z += signZ * overlapZ * 0.55;
          } else {
            vA.slot.physics.swerveOffset += signZ * overlapZ * 0.55;
          }

          if (vB.isPlayer) {
            car.position.z -= signZ * overlapZ * 0.55;
            camera.position.z -= signZ * overlapZ * 0.55;
            controls.target.z -= signZ * overlapZ * 0.55;
          } else {
            vB.slot.physics.swerveOffset -= signZ * overlapZ * 0.55;
          }

          // Dynamic Body Roll (cars tilt away from the impact point)
          vA.phys.rollVel += signZ * impactForce * 6.2;
          vB.phys.rollVel -= signZ * impactForce * 6.2;

          // Yaw kick / momentary steering jerk
          vA.phys.yawVel += signX * signZ * impactForce * 2.8;
          vB.phys.yawVel -= signX * signZ * impactForce * 2.8;

          // Vertical bump bounce
          vA.phys.bounceVel += impactForce * 0.38;
          vB.phys.bounceVel += impactForce * 0.38;

          if (vA.phys.cooldown <= 0 || vB.phys.cooldown <= 0) {
            triggerSparks(contactX, contactY, contactZ, 0, signZ, 24);
            playImpactSound(impactForce);
            if (vA.isPlayer || vB.isPlayer) cameraTrauma = Math.min(1.0, cameraTrauma + 0.52);
            vA.phys.cooldown = 0.22;
            vB.phys.cooldown = 0.22;
          }
        } else {
          // Front / Rear / Head-on Bump
          const signX = Math.sign(dx) || 1;

          // Pitch dive and squat motion
          vA.phys.pitchVel -= signX * impactForce * 5.5;
          vB.phys.pitchVel += signX * impactForce * 5.5;

          // Suspension vertical bounce
          vA.phys.bounceVel += impactForce * 0.45;
          vB.phys.bounceVel += impactForce * 0.45;

          // Speed reaction
          if (vA.isPlayer) speed = Math.max(6, speed - impactForce * 5.5);
          if (vB.isPlayer) speed = Math.max(6, speed - impactForce * 5.5);

          if (vA.phys.cooldown <= 0 || vB.phys.cooldown <= 0) {
            triggerSparks(contactX, contactY, contactZ, signX, 0, 30);
            playImpactSound(impactForce * 1.25);
            if (vA.isPlayer || vB.isPlayer) cameraTrauma = Math.min(1.0, cameraTrauma + 0.68);
            vA.phys.cooldown = 0.25;
            vB.phys.cooldown = 0.25;
          }
        }

        // AI traffic reaction (brake and swerve)
        if (!vA.isPlayer) {
          vA.slot.physics.brakeIntensity = 1.0;
          vA.slot.physics.swerveOffset += (Math.random() - 0.5) * 0.75;
        }
        if (!vB.isPlayer) {
          vB.slot.physics.brakeIntensity = 1.0;
          vB.slot.physics.swerveOffset += (Math.random() - 0.5) * 0.75;
        }
      }
    }
  }

  // Camera Trauma Decay & Screen Shake
  if (cameraTrauma > 0) {
    const shake = cameraTrauma * cameraTrauma;
    camera.position.x += (Math.random() - 0.5) * 0.26 * shake;
    camera.position.y += (Math.random() - 0.5) * 0.18 * shake;
    camera.position.z += (Math.random() - 0.5) * 0.15 * shake;
    cameraTrauma = Math.max(0, cameraTrauma - delta * 2.5);
  }

  // Update flying spark particles
  updateSparks(delta);

  // 5. Coordinated Traffic Light Cycle
  const cycleTime = (t * 0.22) % 18;
  if (cycleTime < 9.0) {
    signalGreenMat.emissiveIntensity = 3.6;
    signalYellowMat.emissiveIntensity = 0.04;
    signalRedMat.emissiveIntensity = 0.04;
    pedWalkMat.emissiveIntensity = 0.04;
    pedDontWalkMat.emissiveIntensity = 3.2;
  } else if (cycleTime < 11.5) {
    signalGreenMat.emissiveIntensity = 0.04;
    signalYellowMat.emissiveIntensity = 3.8;
    signalRedMat.emissiveIntensity = 0.04;
    pedWalkMat.emissiveIntensity = 0.04;
    pedDontWalkMat.emissiveIntensity = 3.2;
  } else {
    signalGreenMat.emissiveIntensity = 0.04;
    signalYellowMat.emissiveIntensity = 0.04;
    signalRedMat.emissiveIntensity = 3.6;
    const isBlinking = cycleTime > 16.0 && Math.sin(t * 12) > 0;
    pedWalkMat.emissiveIntensity = isBlinking ? 0.04 : 3.4;
    pedDontWalkMat.emissiveIntensity = 0.04;
  }

  // 6. Walking Persons along Waterfront Promenade and City Sidewalk
  const strideFreq = 1.65;
  const strideAmp  = 0.36;
  for (const w of walkerData) {
    w.group.position.x += (w.walkSpeed * w.walkDir - speed) * delta;
    if (w.group.position.x < w.lowerBound) w.group.position.x += w.wrapSpan;
    if (w.group.position.x > w.lowerBound + w.wrapSpan) w.group.position.x -= w.wrapSpan;

    const phase = t * strideFreq * Math.PI * 2 + w.phaseOffset;

    w.leftHip.rotation.x  =  Math.sin(phase) * strideAmp;
    w.rightHip.rotation.x = -Math.sin(phase) * strideAmp;

    w.leftKnee.rotation.x  = Math.max(0, -Math.sin(phase) * (strideAmp * 1.35));
    w.rightKnee.rotation.x = Math.max(0,  Math.sin(phase) * (strideAmp * 1.35));

    w.leftArm.rotation.x  = -Math.sin(phase) * (strideAmp * 0.7) + 0.04;
    w.rightArm.rotation.x =  Math.sin(phase) * (strideAmp * 0.7) + 0.04;
    w.leftArm.rotation.z  = -0.06;
    w.rightArm.rotation.z =  0.06;

    w.group.position.y = 0.045 + Math.abs(Math.sin(phase)) * 0.016;
  }

  // 7. Stars & Moon Tracking
  starfield.position.copy(camera.position);
  starfield.material.opacity = 0.88 + Math.sin(t * 1.5) * 0.08;
  moon.position.y = 58 + Math.sin(t * 0.1) * 0.5;

  if (speedDisplay) speedDisplay.textContent = `${Math.round(speed * 3.6).toString().padStart(3, '0')} KM/H`;

  controls.update();
  renderer.render(scene, camera);
});
