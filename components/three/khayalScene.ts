/**
 * Khayal homepage 3D scene (plain three.js, framework-agnostic), styled for the light cream theme.
 *
 * The Gentleman bottle is modelled procedurally from the product photo and
 * moves between scroll "stations" (one per homepage section). Each station
 * also sets the weight of an effect: light beams, mist, golden trails,
 * golden leaves, a liquid-gold swirl and an orbiting ring of light.
 *
 * Usage: const scene = createKhayalScene(canvas, { stationIds, getProgress });
 *        scene.dispose() on unmount.
 */
import * as THREE from "three";

export type StationId = "hero" | "collection" | "n360" | "story" | "notes" | "presence";

interface Station {
  x: number; y: number; s: number; z: number; r: number;
  beams: number; motes: number; spray: number; floor: number;
  trails: number; leaves: number; swirl: number; orbit: number;
}

export interface KhayalSceneOptions {
  stationIds: StationId[];
  /** Returns scroll progress in station units (0 = first station centred). */
  getProgress: () => number;
  labelMarkUrl: string;
  labelFont: string;
  reducedMotion: boolean;
}

export interface KhayalScene {
  /** Extra rotation (radians) applied in the 360 station, driven by drag. */
  setDragRotation: (rad: number) => void;
  dispose: () => void;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function rng(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stations(mobile: boolean): Record<StationId, Station> {
  const m = mobile;
  const fx = { beams: 0, motes: 1, spray: 0, floor: 0, trails: 0, leaves: 0, swirl: 0, orbit: 0 };
  return {
    hero: { x: m ? 0 : 1.75, y: m ? 0.75 : -0.25, s: m ? 0.58 : 0.72, z: 0, r: 0, ...fx, beams: 1, spray: 1, floor: 0.6 },
    collection: { x: 0, y: 5.5, s: 0.5, z: 0, r: 0.5, ...fx, beams: 0.7 },
    n360: { x: 0, y: m ? 0.8 : -0.3, s: m ? 0.56 : 0.7, z: 0, r: 1, ...fx, beams: 0.3, motes: 0.8, floor: 0.4, trails: 1 },
    story: { x: m ? 0 : -1.9, y: m ? 0.9 : -0.1, s: m ? 0.52 : 0.68, z: -0.45, r: 1.6, ...fx, beams: 0.2, motes: 0.8, leaves: 1 },
    notes: { x: m ? 6 : 10, y: 0.4, s: 0.6, z: -0.8, r: 2, ...fx, motes: 0.6, leaves: 0.25, swirl: 1 },
    presence: { x: m ? 0 : 1.7, y: m ? 0.75 : -0.25, s: m ? 0.58 : 0.72, z: 0, r: 3, ...fx, beams: 0.8, floor: 1, orbit: 1 },
  };
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x8a8378, side: THREE.BackSide })));
  const plate = (w: number, h: number, x: number, y: number, z: number, c: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  plate(4, 16, -9, 2, 3, 0xfff1d6); plate(2, 16, 9, 1, 2, 0xffe2b0); plate(14, 2.5, 0, 11, 0, 0xffffff); plate(10, 1.5, 0, -9, 4, 0x6a5232);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(env, 0.02).texture;
  pm.dispose();
  return tex;
}

/* ---------------- The Gentleman bottle ---------------- */
const V = (x: number, y: number) => new THREE.Vector2(x, y);

function buildBottle(markUrl: string, font: string) {
  const bottle = new THREE.Group();
  const inner = new THREE.Group();
  inner.position.y = -2.38;
  bottle.add(inner);

  const glass = new THREE.Mesh(
    new THREE.LatheGeometry([V(0, 0), V(0.72, 0), V(0.9, 0.03), V(0.98, 0.12), V(1, 0.3), V(1, 2.72), V(0.985, 2.86), V(0.93, 2.98), V(0.8, 3.08), V(0.64, 3.15), V(0.57, 3.2), V(0.57, 3.27), V(0, 3.27)], 128),
    new THREE.MeshPhysicalMaterial({ color: 0xfff8ee, transparent: true, opacity: 0.12, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.6, depthWrite: false }),
  );
  glass.renderOrder = 3;
  inner.add(glass);

  inner.add(new THREE.Mesh(
    new THREE.LatheGeometry([V(0, 0.05), V(0.85, 0.05), V(0.93, 0.14), V(0.95, 0.3), V(0.95, 0.84), V(0, 0.84)], 96),
    new THREE.MeshPhysicalMaterial({ color: 0x1a2a7a, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.4, emissive: 0x1a2a7a, emissiveIntensity: 0.25 }),
  ));

  // liquid with the Gentleman gradient: light blue -> blue -> near black
  const LT = 3.24;
  const lg = new THREE.LatheGeometry([V(0, 0.84), V(0.95, 0.84), V(0.955, 1.0), V(0.955, 2.7), V(0.94, 2.84), V(0.89, 2.95), V(0.77, 3.04), V(0.62, 3.11), V(0.53, 3.17), V(0.51, LT), V(0, LT)], 128);
  {
    const p = lg.attributes.position;
    const cols = new Float32Array(p.count * 3);
    const cT = new THREE.Color(0x4fb6e3), cM = new THREE.Color(0x1d5c9e), cL = new THREE.Color(0x0a1230), t = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const k = (p.getY(i) - 0.84) / (LT - 0.84);
      if (k > 0.62) t.copy(cM).lerp(cT, (k - 0.62) / 0.38);
      else t.copy(cL).lerp(cM, Math.max(0, (k - 0.25) / 0.37));
      cols[i * 3] = t.r; cols[i * 3 + 1] = t.g; cols[i * 3 + 2] = t.b;
    }
    lg.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  }
  inner.add(new THREE.Mesh(lg, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.1, clearcoat: 0.7, envMapIntensity: 1 })));

  inner.add(new THREE.Mesh(
    new THREE.LatheGeometry([V(0, 3.25), V(0.58, 3.25), V(0.65, 3.3), V(0.68, 3.42), V(0.65, 3.54), V(0.57, 3.59), V(0, 3.59)], 96),
    new THREE.MeshPhysicalMaterial({ color: 0x4fb6e3, transparent: true, opacity: 0.85, roughness: 0.03, clearcoat: 1, envMapIntensity: 1.8, emissive: 0x1d5c9e, emissiveIntensity: 0.35 }),
  ));

  const chrome = new THREE.MeshStandardMaterial({ color: 0xe2d2b0, metalness: 1, roughness: 0.15, envMapIntensity: 1.6 });
  const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.42, 40), chrome);
  pump.position.y = 3.8; inner.add(pump);
  const pumpTop = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 40), chrome);
  pumpTop.position.y = 4.05; inner.add(pumpTop);
  const nozzle = new THREE.Object3D();
  nozzle.position.set(0.3, 3.66, 0); inner.add(nozzle);

  const cap = new THREE.Group();
  const capMat = new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.2 });
  const tier = (y0: number, y1: number, x1: number) =>
    new THREE.LatheGeometry([V(0, y0), V(x1, y0 + 0.02), V(x1 + 0.02, y0 + 0.05), V(x1 + 0.02, y1 - 0.05), V(x1, y1 - 0.02), V(0, y1)], 96);
  ([[0, 0.53, 0.545], [0.53, 0.72, 0.6], [0.72, 0.96, 0.49], [0.96, 1.16, 0.61]] as const)
    .forEach(([a, b, x]) => cap.add(new THREE.Mesh(tier(a, b, x), capMat)));
  cap.position.y = 3.59;
  inner.add(cap);

  // printed label: silver mark + "THE GENTLEMAN FOR MEN"
  const lc = document.createElement("canvas");
  lc.width = 640; lc.height = 1000;
  const labelTex = new THREE.CanvasTexture(lc);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  labelTex.anisotropy = 8;
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(1.004, 1.004, 1.72, 64, 1, true, -0.62, 1.24),
    new THREE.MeshStandardMaterial({ map: labelTex, transparent: true, metalness: 0.7, roughness: 0.22, depthWrite: false }),
  );
  label.position.y = 1.9; label.renderOrder = 2;
  inner.add(label);
  const img = new Image();
  img.onload = () => {
    const g = lc.getContext("2d")!;
    const w = 300, h = (w * img.height) / img.width;
    g.drawImage(img, (640 - w) / 2, 10, w, h);
    g.fillStyle = "#F2EEE8"; g.textAlign = "center";
    const spaced = (text: string, size: number, weight: number, spacing: number, y: number) => {
      g.font = `${weight} ${size}px ${font}`;
      (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${spacing}px`;
      g.fillText(text, 320 + spacing / 2, y);
    };
    spaced("THE", 40, 400, 10, 640);
    spaced("GENTLEMAN", 76, 500, 2, 725);
    spaced("FOR MEN", 36, 400, 8, 785);
    labelTex.needsUpdate = true;
  };
  img.src = markUrl;

  return { bottle, cap, nozzle };
}

export function createKhayalScene(canvas: HTMLCanvasElement, opts: KhayalSceneOptions): KhayalScene {
  const R = rng(5);
  const reduce = opts.reducedMotion;
  const idle = reduce ? 0 : 1;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const envTex = studioEnvironment(renderer);
  scene.environment = envTex;
  scene.add(new THREE.HemisphereLight(0xfff2dc, 0x1a140c, 0.25));
  const key = new THREE.DirectionalLight(0xffe7c2, 2.2); key.position.set(-4, 8, 6); scene.add(key);
  const rimA = new THREE.DirectionalLight(0xffc77a, 1.6); rimA.position.set(6, 3, -5); scene.add(rimA);
  const rimB = new THREE.DirectionalLight(0xa9cfff, 0.7); rimB.position.set(-6, -1, -4); scene.add(rimB);

  const dotTex = canvasTexture(64, 64, (g) => {
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.35, "rgba(255,255,255,.45)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  });
  const smokeTex = canvasTexture(256, 256, (g, w, h) => {
    const rr = rng(9);
    for (let i = 0; i < 80; i++) {
      const x = w / 2 + (rr() - 0.5) * w * 0.55, y = h / 2 + (rr() - 0.5) * h * 0.5, rad = 18 + rr() * 70, a = 0.04 + rr() * 0.06;
      const r = g.createRadialGradient(x, y, 0, x, y, rad);
      r.addColorStop(0, `rgba(255,255,255,${a})`); r.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = r; g.fillRect(0, 0, w, h);
    }
  });
  const beamTex = canvasTexture(64, 512, (g, w, h) => {
    const x = g.createLinearGradient(0, 0, w, 0);
    x.addColorStop(0, "rgba(255,255,255,0)"); x.addColorStop(0.5, "rgba(255,255,255,1)"); x.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = x; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "destination-in";
    const y = g.createLinearGradient(0, 0, 0, h);
    y.addColorStop(0, "rgba(0,0,0,1)"); y.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = y; g.fillRect(0, 0, w, h);
  });

  const { bottle, cap, nozzle } = buildBottle(opts.labelMarkUrl, opts.labelFont);
  scene.add(bottle);
  void cap;

  /* atmosphere: beams + gold dust */
  const beams: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: beamTex, color: 0xd4b46a, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    m.scale.set(0.6 + R() * 1.4, 14, 1); m.position.set(-1.5 + i * 1.1, 4.5, -3 - R() * 2); m.rotation.z = 0.32 + R() * 0.12;
    m.userData = { o: 0.16 + R() * 0.12, ph: R() * 6 };
    scene.add(m); beams.push(m);
  }
  const MN = 700, mGeo = new THREE.BufferGeometry(), mPos = new Float32Array(MN * 3);
  const mSeed: number[][] = [];
  for (let i = 0; i < MN; i++) mSeed.push([(R() - 0.5) * 16, (R() - 0.5) * 10, -5 + R() * 7, R() * 6, 0.1 + R() * 0.3]);
  mGeo.setAttribute("position", new THREE.BufferAttribute(mPos, 3));
  const motesMat = new THREE.PointsMaterial({ size: 0.04, map: dotTex, color: 0xbfa15f, transparent: true, opacity: 0.6, depthWrite: false });
  scene.add(new THREE.Points(mGeo, motesMat));

  /* hero mist */
  const SN = 700, sGeo = new THREE.BufferGeometry(), sPos = new Float32Array(SN * 3), sCol = new Float32Array(SN * 4);
  const sSeed = Array.from({ length: SN }, () => ({ o: R(), sp: 0.6 + R() * 0.5, a: R() - 0.5, b: R() - 0.5, w: 0.4 + R() * 0.6 }));
  for (let i = 0; i < SN; i++) sCol.set([0.72, 0.68, 0.62, 0], i * 4);
  sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 4));
  const spray = new THREE.Points(sGeo, new THREE.PointsMaterial({ size: 0.55, map: smokeTex, vertexColors: true, transparent: true, depthWrite: false }));
  scene.add(spray);

  /* floor smoke */
  const floor: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: smokeTex, color: 0xc9bca4, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    m.userData = { x: (R() - 0.5) * 4, z: (R() - 0.5) * 1.5, s: 2.5 + R() * 2.5, o: 0.35 + R() * 0.25, sp: (R() - 0.5) * 0.15 };
    scene.add(m); floor.push(m);
  }

  /* golden trails (360) */
  const TN = 2200, tGeo = new THREE.BufferGeometry(), tPos = new Float32Array(TN * 3), tCol = new Float32Array(TN * 4);
  const tSeed = Array.from({ length: TN }, (_, i) => { const strand = i % 5; return { strand, u: R(), r: 1.15 + strand * 0.16 + R() * 0.12, j: (R() - 0.5) * 0.12 }; });
  for (let i = 0; i < TN; i++) { const g = 0.7 + R() * 0.3; tCol.set([0.8 * g, 0.62 * g, 0.3 * g, 0], i * 4); }
  tGeo.setAttribute("position", new THREE.BufferAttribute(tPos, 3));
  tGeo.setAttribute("color", new THREE.BufferAttribute(tCol, 4));
  const trails = new THREE.Points(tGeo, new THREE.PointsMaterial({ size: 0.06, map: dotTex, vertexColors: true, transparent: true, depthWrite: false }));
  scene.add(trails);

  /* golden leaves (story) */
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd4a64a, metalness: 1, roughness: 0.18, clearcoat: 1, envMapIntensity: 1.7, side: THREE.DoubleSide });
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, -0.5); leafShape.quadraticCurveTo(0.42, -0.1, 0, 0.5); leafShape.quadraticCurveTo(-0.42, -0.1, 0, -0.5);
  const leafGeo = new THREE.ShapeGeometry(leafShape, 10);
  { const p = leafGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, Math.abs(x) * 0.35 + Math.sin(y * 3) * 0.05); } leafGeo.computeVertexNormals(); }
  const LN = 34, leaves = new THREE.InstancedMesh(leafGeo, gold, LN);
  leaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(leaves);
  const lSeed = Array.from({ length: LN }, () => ({ x: (R() - 0.5) * 7, z: (R() - 0.5) * 4, o: R(), sp: 0.05 + R() * 0.06, s: 0.12 + R() * 0.22, ax: new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize(), rs: 0.5 + R() * 1.2, sw: R() * 6 }));

  /* liquid-gold swirl (notes) */
  const swirlCurve = new THREE.CatmullRomCurve3(
    [[-0.2, -2.4, 0], [0.8, -1.6, 0.4], [0.2, -0.6, 0.8], [-0.9, -0.1, 0.2], [-0.6, 0.8, -0.6], [0.6, 1.1, -0.2], [0.9, 1.9, 0.5], [0, 2.6, 0.2]]
      .map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );
  const SEG = 260, RAD = 24, swGeo = new THREE.TubeGeometry(swirlCurve, SEG, 0.34, RAD, false);
  {
    const p = swGeo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG; swirlCurve.getPointAt(t, c);
      const f = Math.pow(Math.sin(Math.PI * t), 0.6) * (0.55 + 0.45 * Math.sin(t * 14));
      for (let j = 0; j <= RAD; j++) { const k = i * (RAD + 1) + j; v.fromBufferAttribute(p, k).sub(c).multiplyScalar(f).add(c); p.setXYZ(k, v.x, v.y, v.z); }
    }
    swGeo.computeVertexNormals();
  }
  const liquidGold = new THREE.MeshPhysicalMaterial({ color: 0xf0c060, metalness: 0.75, roughness: 0.1, emissive: 0x5a3a10, emissiveIntensity: 0.35, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2, transparent: true, opacity: 0 });
  const swirl = new THREE.Mesh(swGeo, liquidGold);
  scene.add(swirl);
  const dropGeo = new THREE.SphereGeometry(0.1, 24, 16);
  const drops = Array.from({ length: 7 }, () => {
    const d = new THREE.Mesh(dropGeo, liquidGold);
    d.scale.set(0.7 + R() * 0.7, 1.35, 0.7 + R() * 0.7);
    d.userData = { o: R(), x: (R() - 0.5) * 0.5 };
    scene.add(d); return d;
  });

  /* orbiting ring of light (presence) */
  const ON = 1400, oGeo = new THREE.BufferGeometry(), oPos = new Float32Array(ON * 3), oCol = new Float32Array(ON * 4);
  const oSeed = Array.from({ length: ON }, (_, i) => {
    const ring = i < 1000;
    return { ring, a: ring ? (i / 1000) * Math.PI * 2 : R() * Math.PI * 2, j: (R() - 0.5) * (ring ? 0.06 : 2.2), y: (R() - 0.5) * (ring ? 0.05 : 3.6), r: ring ? 0 : 1 + R() * 1.6 };
  });
  for (let i = 0; i < ON; i++) oCol.set([0.78, 0.58, 0.24, 0], i * 4);
  oGeo.setAttribute("position", new THREE.BufferAttribute(oPos, 3));
  oGeo.setAttribute("color", new THREE.BufferAttribute(oCol, 4));
  const orbit = new THREE.Points(oGeo, new THREE.PointsMaterial({ size: 0.13, map: dotTex, vertexColors: true, transparent: true, depthWrite: false }));
  scene.add(orbit);

  /* sizing + interaction */
  let mobile = false;
  let K = stations(false);
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    mobile = w < 860;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = mobile ? 12.5 : 10;
    camera.updateProjectionMatrix();
    K = stations(mobile);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const ptr = { x: 0, y: 0 }, sp = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => { ptr.x = e.clientX / window.innerWidth - 0.5; ptr.y = e.clientY / window.innerHeight - 0.5; };
  window.addEventListener("pointermove", onPointer, { passive: true });

  let dragRot = 0;
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);

  const ids = opts.stationIds;
  const sample = (p: number): Station => {
    const i = Math.min(Math.floor(p), ids.length - 2);
    const t = easeIO(clamp(p - i, 0, 1));
    const a = K[ids[i]], b = K[ids[i + 1]];
    const o = {} as Station;
    (Object.keys(a) as (keyof Station)[]).forEach((k) => { o[k] = lerp(a[k], b[k], t); });
    return o;
  };

  let cur: Station | null = null;
  let introStart: number | null = null;
  let raf = 0;
  const clock = new THREE.Clock();
  const vA = new THREE.Vector3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3();

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible) return;
    const t = clock.elapsedTime;
    const tgt = sample(clamp(opts.getProgress(), 0, ids.length - 1));
    if (!cur) cur = { ...tgt };
    const k = 1 - Math.pow(0.002, dt);
    (Object.keys(tgt) as (keyof Station)[]).forEach((key) => { cur![key] += (tgt[key] - cur![key]) * k; });
    const c = cur;
    sp.x += (ptr.x - sp.x) * dt * 3; sp.y += (ptr.y - sp.y) * dt * 3;

    // bottle drops in from above on first load, then follows the stations
    if (introStart === null) introStart = now;
    const it = reduce ? 1 : clamp((now - introStart) / 2200, 0, 1), drop = 1 - Math.pow(1 - it, 4);
    bottle.position.set(c.x + sp.x * 0.25, c.y + (1 - drop) * 7 + Math.sin(t * 1.1) * 0.05 * idle, 0);
    bottle.scale.setScalar(c.s);
    bottle.rotation.set(
      sp.y * 0.1,
      c.r * Math.PI * 2 + dragRot * c.trails - sp.x * 0.3 + Math.sin(t * 0.45) * 0.1 * idle - (1 - drop) * 1.6,
      c.z + Math.sin(t * 0.7) * 0.02 * idle + (1 - drop) * 0.3 + (c.leaves > 0.5 ? Math.sin(t * 0.6) * 0.08 * idle : 0),
    );

    beams.forEach((m) => { m.material.opacity = m.userData.o * c.beams * (0.75 + 0.25 * Math.sin(t * 0.7 + m.userData.ph)); });
    for (let i = 0; i < MN; i++) {
      const s = mSeed[i];
      mPos[i * 3] = s[0] + Math.sin(t * 0.2 + s[3]) * 0.3;
      mPos[i * 3 + 1] = (((s[1] + t * s[4] * idle + 5) % 10) + 10) % 10 - 5;
      mPos[i * 3 + 2] = s[2];
    }
    mGeo.attributes.position.needsUpdate = true;
    motesMat.opacity = 0.55 * c.motes;

    const puff = reduce ? 0.4 : Math.pow(Math.max(0, Math.sin(t * 0.9)), 3);
    spray.visible = c.spray > 0.02;
    if (spray.visible) {
      nozzle.getWorldPosition(vA);
      for (let i = 0; i < SN; i++) {
        const s = sSeed[i], life = (s.o + t * 0.22 * s.sp) % 1, d = life * 4.2 * s.w * c.s;
        sPos[i * 3] = vA.x + d; sPos[i * 3 + 1] = vA.y + s.a * life * 1.4 * c.s + life * 0.6; sPos[i * 3 + 2] = vA.z + s.b * life * 1.2;
        sCol[i * 4 + 3] = c.spray * (1 - life) * Math.min(life * 10, 1) * 0.42 * (0.5 + 0.5 * puff);
      }
      sGeo.attributes.position.needsUpdate = true; sGeo.attributes.color.needsUpdate = true;
    }

    const base = bottle.position.y - 2.1 * c.s;
    floor.forEach((m, i) => {
      const u = m.userData;
      m.position.set(bottle.position.x + u.x + Math.sin(t * u.sp + i) * 0.5, base + 0.15, u.z);
      m.scale.set(u.s, u.s * 0.45, 1); m.lookAt(camera.position);
      m.material.opacity = u.o * c.floor * 0.45;
    });

    trails.visible = c.trails > 0.02;
    if (trails.visible) {
      for (let i = 0; i < TN; i++) {
        const s = tSeed[i], u = (s.u + t * 0.06 * idle) % 1, ang = u * Math.PI * 4 + s.strand * 1.26 + t * 0.5 * idle + dragRot * 0.6, y = (u - 0.5) * 4.6;
        const rr = s.r * (1 + 0.25 * Math.sin(u * 9 + s.strand)) * c.s;
        tPos[i * 3] = bottle.position.x + Math.cos(ang) * rr + s.j; tPos[i * 3 + 1] = bottle.position.y + y * c.s + s.j; tPos[i * 3 + 2] = Math.sin(ang) * rr * 0.7;
        tCol[i * 4 + 3] = c.trails * Math.sin(Math.PI * u);
      }
      tGeo.attributes.position.needsUpdate = true; tGeo.attributes.color.needsUpdate = true;
    }

    leaves.visible = c.leaves > 0.02;
    if (leaves.visible) {
      for (let i = 0; i < LN; i++) {
        const s = lSeed[i], u = (s.o + t * s.sp * idle) % 1;
        _p.set(bottle.position.x * 0.4 + s.x + Math.sin(t * 0.5 + s.sw) * 0.6, 4.5 - u * 9, s.z);
        _q.setFromAxisAngle(s.ax, t * s.rs * idle + s.sw);
        _s.setScalar(s.s * c.leaves * Math.min(1, Math.sin(Math.PI * u) * 3));
        _m.compose(_p, _q, _s); leaves.setMatrixAt(i, _m);
      }
      leaves.instanceMatrix.needsUpdate = true;
    }

    swirl.visible = c.swirl > 0.02;
    liquidGold.opacity = c.swirl;
    swirl.position.set(mobile ? 0 : -2.6, mobile ? 1.2 : 0, 0);
    swirl.rotation.set(0, t * 0.25 * idle, 0.15);
    swirl.scale.setScalar(mobile ? 0.55 : 0.85);
    drops.forEach((d) => {
      d.visible = swirl.visible;
      const u = (d.userData.o + t * 0.35 * idle) % 1;
      d.position.set(swirl.position.x + 0.1 + d.userData.x, swirl.position.y - 1.9 * swirl.scale.y - u * 2.6, 0.2);
    });

    orbit.visible = c.orbit > 0.02;
    if (orbit.visible) {
      const head = t * 1.6 * idle + 0.3;
      for (let i = 0; i < ON; i++) {
        const s = oSeed[i];
        if (s.ring) {
          const rx = 1.7 * c.s, ry = 0.45 * c.s;
          const x = Math.cos(s.a) * rx, z = Math.sin(s.a) * rx, y = Math.sin(s.a) * ry * 0.9 + s.y;
          const ty = y * Math.cos(0.35) - z * Math.sin(0.35), tz = y * Math.sin(0.35) + z * Math.cos(0.35);
          oPos[i * 3] = bottle.position.x + x + s.j; oPos[i * 3 + 1] = bottle.position.y + 0.1 + ty; oPos[i * 3 + 2] = tz;
          const d = (((head - s.a) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          oCol[i * 4 + 3] = Math.min(1, c.orbit * Math.pow(1 - d / (Math.PI * 2), 1.6) * 1.8);
        } else {
          const tw = 0.5 + 0.5 * Math.sin(t * 3 + s.a * 7);
          oPos[i * 3] = bottle.position.x + Math.cos(s.a) * s.r; oPos[i * 3 + 1] = bottle.position.y + s.y; oPos[i * 3 + 2] = Math.sin(s.a) * s.r * 0.6 - 0.5;
          oCol[i * 4 + 3] = c.orbit * tw * 0.35;
        }
      }
      oGeo.attributes.position.needsUpdate = true; oGeo.attributes.color.needsUpdate = true;
    }

    camera.position.x = sp.x * 0.3; camera.position.y = -sp.y * 0.2; camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  return {
    setDragRotation: (rad) => { dragRot = rad; },
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else if (mat) mat.dispose();
      });
      [dotTex, smokeTex, beamTex, envTex].forEach((t) => t.dispose());
      renderer.dispose();
    },
  };
}
