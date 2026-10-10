import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { Timeline, clamp01, ease, lerp } from '@/lib/motion';

/*
 * Aureon hero: a real-time, physically lit strength-training floor that assembles
 * object by object. Every piece is modelled in code to real-world dimensions (metres):
 * IWF-proportioned barbell and bumper plates, 2.3 m power rack, flat bench, hex dumbbell
 * rack, dual-stack functional trainer and treadmills. No external models or photos.
 */

export type HeroTheme = 'dark' | 'light';
export type HeroLayout = 'desktop' | 'mobile';
export type HeroShot = 'plates' | 'bench' | 'trainer' | 'entrance' | 'ceiling';
const SHOTS: Record<HeroShot, { fov: number; pos: THREE.Vector3; look: THREE.Vector3 }> = {
  plates: { fov: 30, pos: new THREE.Vector3(2.05, 1.72, 0.75), look: new THREE.Vector3(0.62, 1.47, -0.5) },
  bench: { fov: 34, pos: new THREE.Vector3(3.7, 1.2, 2.7), look: new THREE.Vector3(2.0, 0.42, 0.65) },
  trainer: { fov: 46, pos: new THREE.Vector3(-1.9, 1.5, 1.7), look: new THREE.Vector3(-4.4, 1.05, -2.5) },
  entrance: { fov: 46, pos: new THREE.Vector3(0.9, 1.6, 6.4), look: new THREE.Vector3(0.1, 1.15, -1.6) },
  ceiling: { fov: 44, pos: new THREE.Vector3(1.6, 1.6, 2.4), look: new THREE.Vector3(-1.2, 3.1, -3.8) },
};
export interface GymSceneOptions {
  theme: HeroTheme;
  instant: boolean;
  /** Evidence/debug only: render the timeline frozen at this clock value (ms). */
  freezeAt?: number;
  /** Still-generation only: a fixed editorial camera instead of the hero framing. */
  shot?: HeroShot;
  onFirstFrame?: () => void;
  onSettled?: () => void;
}
export interface GymSceneApi {
  setTheme(theme: HeroTheme): void;
  resize(): void;
  capture(type?: string, quality?: number): string;
  dispose(): void;
}

const ASSEMBLY_MS = 4600;

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** EPDM rubber-tile fleck texture, deterministic so static stills match the live render. */
function rubberTexture() {
  const size = 512, c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, size, size);
  const r = rng(7);
  for (let i = 0; i < 16000; i++) {
    const v = 150 + Math.floor(r() * 105);
    g.fillStyle = `rgb(${v},${v},${v})`;
    const s = 1 + r() * 2.2;
    g.fillRect(r() * size, r() * size, s, s * (0.6 + r() * 0.8));
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

/** Fine vertical grain for timber slats / brushed surfaces. */
function grainTexture(seed: number) {
  const w = 256, h = 512, c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = '#e6e6e6'; g.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < 260; i++) {
    const x = r() * w, v = 175 + Math.floor(r() * 80);
    g.strokeStyle = `rgba(${v},${v},${v},${0.35 + r() * 0.5})`;
    g.lineWidth = 0.6 + r() * 2.2;
    g.beginPath(); g.moveTo(x, 0);
    for (let y = 0; y <= h; y += 32) g.lineTo(x + Math.sin(y * 0.01 + i) * 2.5, y);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

interface ThemeLook {
  background: string; fog: [number, number];
  floor: string; floorBase: string; wall: string; slat: string; ceiling: string;
  glass: string; glassEmissive: string; glassEmissiveIntensity: number;
  env: number; exposure: number;
  hemiSky: string; hemiGround: string; hemi: [number, number];
  key: [number, number]; keyColor: string;
  bar: [number, number]; barColor: string; barEmissive: [number, number];
  cove: [number, number]; brand: [number, number];
}

const LOOKS: Record<HeroTheme, ThemeLook> = {
  dark: {
    background: '#0b100e', fog: [11, 26],
    floor: '#2a2d2b', floorBase: '#070908', wall: '#1a201d', slat: '#5a4630', ceiling: '#0d1110',
    glass: '#0e1614', glassEmissive: '#1c2a2a', glassEmissiveIntensity: 0.55,
    env: 0.32, exposure: 1.0,
    hemiSky: '#9fb2a4', hemiGround: '#120f0b', hemi: [0.12, 0.3],
    key: [11, 46], keyColor: '#ffe2b8',
    bar: [0, 15], barColor: '#ffdcae', barEmissive: [0.05, 6],
    cove: [0, 2.6], brand: [0, 3.2],
  },
  light: {
    background: '#e8e3d8', fog: [14, 34],
    floor: '#8c8a83', floorBase: '#5d5b55', wall: '#e7e2d6', slat: '#b99566', ceiling: '#efebe2',
    glass: '#d9dfd9', glassEmissive: '#fbf7ec', glassEmissiveIntensity: 1.05,
    env: 0.85, exposure: 0.92,
    hemiSky: '#fffaf0', hemiGround: '#8d8577', hemi: [0.9, 1.35],
    key: [14, 30], keyColor: '#fff4e2',
    bar: [0, 3.2], barColor: '#fff1dc', barEmissive: [0.4, 2.6],
    cove: [0, 1.1], brand: [0, 1.4],
  },
};

const CAMERAS: Record<HeroLayout, { fov: number; from: THREE.Vector3; to: THREE.Vector3; look: THREE.Vector3; lookFrom: THREE.Vector3; shift: [number, number] }> = {
  desktop: {
    fov: 33,
    from: new THREE.Vector3(5.6, 3.1, 10.8), to: new THREE.Vector3(3.6, 1.72, 7.6),
    lookFrom: new THREE.Vector3(0.2, 1.3, -1.6), look: new THREE.Vector3(0.35, 1.08, -1.25),
    shift: [-0.19, 0.02],
  },
  mobile: {
    fov: 47,
    from: new THREE.Vector3(3.4, 3.4, 10.4), to: new THREE.Vector3(2.3, 2.05, 7.4),
    lookFrom: new THREE.Vector3(0.3, 1.5, -1.4), look: new THREE.Vector3(0.2, 1.42, -1.2),
    shift: [0, -0.2],
  },
};

export function createGymScene(canvas: HTMLCanvasElement, options: GymSceneOptions): GymSceneApi {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  RectAreaLightUniformsLib.init();

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.fog = new THREE.Fog('#000', 10, 30);

  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 80);
  let layout: HeroLayout = 'desktop';
  let theme = options.theme;
  const disposables: { dispose(): void }[] = [envRT, pmrem];
  const track = <T extends { dispose(): void }>(x: T) => { disposables.push(x); return x; };

  /* ---------- Materials ---------- */
  const rubberMap = track(rubberTexture());
  const grain = track(grainTexture(11));
  const M = {
    floor: track(new THREE.MeshStandardMaterial({ map: rubberMap, roughnessMap: rubberMap, roughness: 0.92, metalness: 0 })),
    floorBase: track(new THREE.MeshStandardMaterial({ roughness: 0.95 })),
    wall: track(new THREE.MeshStandardMaterial({ roughness: 0.88 })),
    slat: track(new THREE.MeshStandardMaterial({ map: grain, roughness: 0.62 })),
    ceiling: track(new THREE.MeshStandardMaterial({ roughness: 0.9 })),
    glass: track(new THREE.MeshPhysicalMaterial({ roughness: 0.08, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 })),
    powder: track(new THREE.MeshPhysicalMaterial({ color: '#141716', roughness: 0.42, metalness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 })),
    powderEdge: track(new THREE.MeshStandardMaterial({ color: '#2a2e2c', roughness: 0.35, metalness: 0.7 })),
    hole: track(new THREE.MeshBasicMaterial({ color: '#030404' })),
    chrome: track(new THREE.MeshStandardMaterial({ color: '#e4e4e2', roughness: 0.14, metalness: 1 })),
    satin: track(new THREE.MeshStandardMaterial({ color: '#b9bab6', roughness: 0.32, metalness: 1 })),
    rubber: track(new THREE.MeshStandardMaterial({ color: '#121313', roughness: 0.74, metalness: 0 })),
    rubberSoft: track(new THREE.MeshStandardMaterial({ color: '#1b1c1c', roughness: 0.86, metalness: 0 })),
    brass: track(new THREE.MeshPhysicalMaterial({ color: '#c38a2c', roughness: 0.28, metalness: 1, clearcoat: 0.4 })),
    leather: track(new THREE.MeshPhysicalMaterial({ color: '#151514', roughness: 0.52, metalness: 0, sheen: 0.6, sheenRoughness: 0.45, sheenColor: new THREE.Color('#6b5a45') })),
    uhmw: track(new THREE.MeshStandardMaterial({ color: '#0b0b0b', roughness: 0.55 })),
    screen: track(new THREE.MeshStandardMaterial({ color: '#050807', roughness: 0.15, metalness: 0.2, emissive: new THREE.Color('#203a33'), emissiveIntensity: 0 })),
    belt: track(new THREE.MeshStandardMaterial({ color: '#0d0e0e', roughness: 0.95 })),
    alu: track(new THREE.MeshStandardMaterial({ color: '#8f9290', roughness: 0.38, metalness: 0.9 })),
    lightBar: track(new THREE.MeshStandardMaterial({ color: '#191b1a', roughness: 0.4, metalness: 0.6 })),
    diffuser: track(new THREE.MeshStandardMaterial({ color: '#fff3df', emissive: new THREE.Color('#ffd9a8'), emissiveIntensity: 0, roughness: 0.6 })),
    cove: track(new THREE.MeshStandardMaterial({ color: '#2a2016', emissive: new THREE.Color('#ffb85c'), emissiveIntensity: 0 })),
    chevron: track(new THREE.MeshStandardMaterial({ color: '#c8913c', metalness: 0.9, roughness: 0.25, emissive: new THREE.Color('#ffb24f'), emissiveIntensity: 0 })),
    cable: track(new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.5 })),
  };

  const geo = <G extends THREE.BufferGeometry>(g: G) => track(g);
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, cast = true, receive = true) => {
    const o = new THREE.Mesh(g, m);
    o.castShadow = cast; o.receiveShadow = receive;
    return o;
  };
  const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const o = mesh(geo(new THREE.BoxGeometry(w, h, d)), m);
    o.position.set(x, y, z);
    return o;
  };
  const rbox = (w: number, h: number, d: number, r: number, m: THREE.Material) => mesh(geo(new RoundedBoxGeometry(w, h, d, 3, r)), m);
  const cyl = (r: number, len: number, m: THREE.Material, seg = 32) => mesh(geo(new THREE.CylinderGeometry(r, r, len, seg)), m);
  /** Pivot group so a part can grow from its base (scale.y) or drop in. */
  const pivot = (child: THREE.Object3D, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.add(child);
    return g;
  };

  const tl = new Timeline();
  const world = new THREE.Group();
  scene.add(world);

  /* ---------- Shared tween helpers ---------- */
  const show = (o: THREE.Object3D, p: number) => { o.visible = p > 0; };
  function grow(o: THREE.Object3D, start: number, dur: number, easing = ease.outQuart) {
    tl.add(start, dur, p => { show(o, p); o.scale.y = Math.max(0.0001, easing(p)); });
  }
  function drop(o: THREE.Object3D, start: number, dur: number, height = 1.2, easing: (t: number) => number = ease.settle) {
    const base = o.position.y;
    tl.add(start, dur, p => { show(o, p); o.position.y = base + height * (1 - easing(p)); });
  }
  function slide(o: THREE.Object3D, start: number, dur: number, offset: THREE.Vector3, easing: (t: number) => number = ease.outQuart) {
    const base = o.position.clone();
    tl.add(start, dur, p => {
      show(o, p);
      const e = easing(p);
      o.position.set(base.x + offset.x * (1 - e), base.y + offset.y * (1 - e), base.z + offset.z * (1 - e));
    });
  }

  /* ---------- 1. Foundation: rubber tiles seat outward from the training zone ---------- */
  const floorBase = mesh(geo(new THREE.PlaneGeometry(60, 40)), M.floorBase, false, true);
  floorBase.rotation.x = -Math.PI / 2;
  floorBase.position.set(0, -0.002, 0);
  world.add(floorBase);
  tl.add(0, 500, p => { show(floorBase, p); });

  const tileGeo = geo(new THREE.BoxGeometry(0.992, 0.03, 0.992));
  const tilesX = 18, tilesZ = 12, tileOrigin = new THREE.Vector3(-9 + 0.5, 0.015, -4.4 + 0.5);
  const tiles = new THREE.InstancedMesh(tileGeo, M.floor, tilesX * tilesZ);
  tiles.receiveShadow = true;
  const tileData: { x: number; z: number; delay: number }[] = [];
  const centre = new THREE.Vector2(0.4, -1.2);
  for (let ix = 0; ix < tilesX; ix++) for (let iz = 0; iz < tilesZ; iz++) {
    const x = tileOrigin.x + ix, z = tileOrigin.z + iz;
    tileData.push({ x, z, delay: new THREE.Vector2(x, z).distanceTo(centre) * 42 });
  }
  const tm = new THREE.Matrix4(), tq = new THREE.Quaternion(), ts = new THREE.Vector3(), tp = new THREE.Vector3();
  tl.add(60, 1000, p => {
    const ms = p * 1000;
    tiles.visible = p > 0;
    tileData.forEach((t, i) => {
      const k = clamp01((ms - t.delay * 0.62) / 360);
      const e = ease.outCubic(k);
      tp.set(t.x, tileOrigin.y - 0.06 * (1 - e) + (k > 0 ? 0 : -1), t.z);
      ts.set(1, k > 0 ? Math.max(0.01, e) : 0.001, 1);
      tm.compose(tp, tq, ts);
      tiles.setMatrixAt(i, tm);
    });
    tiles.instanceMatrix.needsUpdate = true;
  });
  world.add(tiles);
  // Platform inlay under the rack: 8x8 cm oak edging, like a real lifting platform.
  const platform = new THREE.Group();
  const plat = box(2.6, 0.04, 2.6, M.rubberSoft, 0, 0.02, 0); plat.receiveShadow = true;
  const oak = box(1.0, 0.042, 2.6, M.slat, 0, 0.021, 0);
  platform.add(plat, oak);
  platform.position.set(0, 0.03, -1.15);
  world.add(platform);
  drop(platform, 650, 520, 0.12, ease.outCubic);

  /* ---------- 2. Architecture: back wall, timber slats, window band, ceiling beams ---------- */
  const architecture = new THREE.Group();
  world.add(architecture);
  const wallZ = -4.4;
  const wall = box(30, 6, 0.2, M.wall, 0, 3, wallZ - 0.1); wall.castShadow = false;
  architecture.add(wall);
  tl.add(300, 700, p => { show(wall, p); wall.scale.y = Math.max(0.001, ease.outQuart(p)); wall.position.y = 3 * ease.outQuart(p); });

  // Timber slat feature wall (left) – 45 mm slats at 90 mm centres.
  const slatGeo = geo(new THREE.BoxGeometry(0.045, 4.2, 0.04));
  const SLATS = 86;
  const slats = new THREE.InstancedMesh(slatGeo, M.slat, SLATS);
  slats.castShadow = false; slats.receiveShadow = true;
  architecture.add(slats);
  const slatStart = -8.6;
  tl.add(420, 900, p => {
    const ms = p * 900;
    slats.visible = p > 0;
    for (let i = 0; i < SLATS; i++) {
      const k = ease.outCubic(clamp01((ms - (SLATS - 1 - i) * 5) / 420));
      tp.set(slatStart + i * 0.09, 2.1 * k + (k > 0 ? 0 : -9), wallZ + 0.03);
      ts.set(1, Math.max(0.001, k), 1);
      tm.compose(tp, tq, ts);
      slats.setMatrixAt(i, tm);
    }
    slats.instanceMatrix.needsUpdate = true;
  });

  // Window band with steel mullions to the right of the slats.
  const glass = box(8.2, 3.0, 0.03, M.glass, 3.2, 2.05, wallZ + 0.02);
  glass.castShadow = false;
  architecture.add(glass);
  tl.add(520, 700, p => { show(glass, p); glass.scale.y = Math.max(0.001, ease.outQuart(p)); });
  const mullions = new THREE.Group();
  for (let i = 0; i <= 7; i++) mullions.add(box(0.07, 3.1, 0.09, M.powder, -0.9 + i * (8.2 / 7), 2.05, wallZ + 0.06));
  mullions.add(box(8.3, 0.09, 0.1, M.powder, 3.2, 0.52, wallZ + 0.06), box(8.3, 0.09, 0.1, M.powder, 3.2, 3.58, wallZ + 0.06), box(8.3, 0.05, 0.09, M.powder, 3.2, 2.62, wallZ + 0.06));
  architecture.add(mullions);
  drop(mullions, 700, 640, 1.1, ease.outQuart);
  const rightWall = box(6, 6, 0.2, M.wall, 8.4, 3, wallZ - 0.08);
  architecture.add(rightWall);

  // Ceiling plane + exposed steel beams.
  const ceiling = box(30, 0.1, 14, M.ceiling, 0, 4.25, 1.5); ceiling.castShadow = false;
  architecture.add(ceiling);
  const beams = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const z = wallZ + 1.2 + i * 2.2;
    beams.add(box(30, 0.32, 0.16, M.powder, 0, 4.04, z));
  }
  architecture.add(beams);
  slide(beams, 820, 700, new THREE.Vector3(0, 0, -6), ease.outQuart);
  tl.add(0, 1, p => { show(ceiling, 1); show(rightWall, p); });

  // Floor + ceiling LED coves along the wall (lit later).
  const coveLow = box(30, 0.025, 0.05, M.cove, 0, 0.04, wallZ + 0.04); coveLow.castShadow = false;
  const coveHigh = box(30, 0.03, 0.06, M.cove, 0, 4.05, wallZ + 0.05); coveHigh.castShadow = false;
  architecture.add(coveLow, coveHigh);

  /* ---------- 3. Power rack (first recognisable silhouette) ---------- */
  const rack = new THREE.Group();
  rack.position.set(0, 0.07, -1.15);
  world.add(rack);
  const RW = 1.22 / 2, RD = 1.2 / 2, RH = 2.3, U = 0.075;
  const holeGeo = geo(new THREE.BoxGeometry(0.022, 0.022, 0.004));
  const uprights: THREE.Group[] = [];
  [[-RW, RD], [RW, RD], [-RW, -RD], [RW, -RD]].forEach(([x, z], i) => {
    const post = box(U, RH, U, M.powder, 0, RH / 2, 0);
    const g = pivot(post, x, 0, z);
    const holes = new THREE.InstancedMesh(holeGeo, M.hole, 2 * 36);
    let n = 0;
    for (let k = 0; k < 36; k++) {
      const y = 0.42 + k * 0.05;
      tm.compose(tp.set(0, y, (z > 0 ? 1 : -1) * (U / 2 + 0.0015)), tq, ts.set(1, 1, 1)); holes.setMatrixAt(n++, tm);
      const sq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
      tm.compose(tp.set((x > 0 ? 1 : -1) * (U / 2 + 0.0015), y, 0), sq, ts.set(1, 1, 1)); holes.setMatrixAt(n++, tm);
    }
    g.add(holes);
    // Feet plates
    g.add(box(0.16, 0.012, 0.16, M.powderEdge, 0, 0.006, 0));
    rack.add(g);
    uprights.push(g);
    grow(g, 420 + i * 70, 520, ease.outQuart);
  });
  const rackTop = new THREE.Group();
  rackTop.add(
    box(RW * 2 + U, U, U, M.powder, 0, RH - U / 2, RD), box(RW * 2 + U, U, U, M.powder, 0, RH - U / 2, -RD),
    box(U, U, RD * 2, M.powder, -RW, RH - U / 2, 0), box(U, U, RD * 2, M.powder, RW, RH - U / 2, 0),
  );
  const pull = cyl(0.016, RW * 2 + 0.28, M.satin); pull.rotation.z = Math.PI / 2; pull.position.set(0, RH - 0.02, RD + 0.1);
  rackTop.add(pull, box(0.05, 0.05, 0.1, M.powder, -RW, RH - 0.03, RD + 0.06), box(0.05, 0.05, 0.1, M.powder, RW, RH - 0.03, RD + 0.06));
  rack.add(rackTop);
  drop(rackTop, 860, 560, 0.7);
  const rackBase = new THREE.Group();
  rackBase.add(box(U, 0.05, RD * 2 + 0.25, M.powder, -RW, 0.025, 0), box(U, 0.05, RD * 2 + 0.25, M.powder, RW, 0.025, 0), box(RW * 2, 0.05, U, M.powder, 0, 0.025, -RD));
  rack.add(rackBase);
  tl.add(380, 300, p => { show(rackBase, p); rackBase.scale.set(1, 1, Math.max(0.001, ease.outCubic(p))); });

  // J-hooks + safety arms.
  const hooks = new THREE.Group();
  const barY = 1.38;
  for (const x of [-RW, RW]) {
    hooks.add(box(0.09, 0.14, 0.03, M.powder, x, barY - 0.02, RD + U / 2 + 0.015));
    hooks.add(box(0.08, 0.025, 0.11, M.powder, x, barY - 0.085, RD + 0.1));
    hooks.add(box(0.08, 0.06, 0.02, M.uhmw, x, barY - 0.05, RD + 0.15));
    const arm = box(0.06, 0.06, RD * 2 + 0.5, M.powder, x, 0.82, 0.12);
    hooks.add(arm, box(0.07, 0.02, RD * 2 + 0.5, M.uhmw, x, 0.86, 0.12));
  }
  rack.add(hooks);
  slide(hooks, 1080, 380, new THREE.Vector3(0, 0, 0.35), ease.outCubic);

  // Plate-storage horns on the rear uprights, loaded with plates.
  const plateCache = new Map<string, THREE.BufferGeometry[]>();
  function bumper(R: number, T: number, rubberMat: THREE.Material = M.rubber) {
    const key = `${R}-${T}`;
    let geos = plateCache.get(key);
    if (!geos) {
      const h = T / 2, c = Math.min(0.012, T * 0.22);
      const body = [
        [0.071, -h + 0.006], [0.15, -h + 0.002], [R - c * 1.6, -h], [R - c * 0.5, -h + c * 0.3], [R, -h + c],
        [R, h - c], [R - c * 0.5, h - c * 0.3], [R - c * 1.6, h], [0.15, h - 0.002], [0.071, h - 0.006],
      ].map(([x, y]) => new THREE.Vector2(x, y));
      const insert = [[0.0258, -h + 0.002], [0.072, -h + 0.002], [0.072, h - 0.002], [0.0258, h - 0.002], [0.0258, -h + 0.002]].map(([x, y]) => new THREE.Vector2(x, y));
      geos = [geo(new THREE.LatheGeometry(body, 72)), geo(new THREE.LatheGeometry(insert, 40))];
      plateCache.set(key, geos);
    }
    const g = new THREE.Group();
    g.add(mesh(geos[0], rubberMat), mesh(geos[1], M.satin));
    return g;
  }
  for (const side of [-1, 1]) {
    const horn = cyl(0.025, 0.24, M.powder); horn.rotation.z = Math.PI / 2;
    horn.position.set(side * (RW + 0.12), 0.48, -RD);
    rack.add(horn);
    grow(horn, 700, 300);
    [0.07, 0.07, 0.05].forEach((T, k) => {
      const pl = bumper(0.225, T);
      pl.rotation.z = Math.PI / 2;
      pl.position.set(side * (RW + 0.07 + k * 0.075 + T / 2), 0.48, -RD);
      rack.add(pl);
      slide(pl, 2550 + k * 110 + (side > 0 ? 60 : 0), 520, new THREE.Vector3(side * 0.7, 0, 0), ease.outCubic);
    });
  }

  /* ---------- 4. Loaded barbell: bar lands on the hooks, plates slide on one by one ---------- */
  const bar = new THREE.Group();
  bar.position.set(0, barY + 0.025, RD + 0.1);
  rack.add(bar);
  const shaft = cyl(0.014, 1.31, M.satin, 24); shaft.rotation.z = Math.PI / 2;
  bar.add(shaft);
  for (const side of [-1, 1]) {
    const collar = cyl(0.036, 0.03, M.chrome); collar.rotation.z = Math.PI / 2; collar.position.x = side * 0.67;
    const sleeve = cyl(0.025, 0.415, M.chrome); sleeve.rotation.z = Math.PI / 2; sleeve.position.x = side * (0.685 + 0.2075);
    const cap = cyl(0.027, 0.012, M.satin); cap.rotation.z = Math.PI / 2; cap.position.x = side * 1.1;
    // Knurl rings at the IWF hand marks.
    const mark = cyl(0.0145, 0.004, M.powderEdge, 16); mark.rotation.z = Math.PI / 2; mark.position.x = side * 0.455;
    bar.add(collar, sleeve, cap, mark);
  }
  drop(bar, 1250, 640, 1.05);
  const barPlates: { R: number; T: number; mat?: THREE.Material }[] = [
    { R: 0.225, T: 0.066 }, { R: 0.225, T: 0.066 }, { R: 0.225, T: 0.053 }, { R: 0.16, T: 0.03, mat: M.rubberSoft },
  ];
  let order = 0;
  for (let k = 0; k < barPlates.length; k++) {
    let x = 0.7;
    for (let j = 0; j < k; j++) x += barPlates[j].T + 0.002;
    for (const side of [-1, 1]) {
      const { R, T, mat } = barPlates[k];
      const pl = bumper(R, T, mat);
      pl.rotation.z = Math.PI / 2;
      pl.position.set(side * (x + T / 2), 0, 0);
      bar.add(pl);
      slide(pl, 1820 + order * 95, 430, new THREE.Vector3(side * 0.55, 0, 0), ease.outCubic);
      order++;
    }
  }
  let clampX = 0.7;
  barPlates.forEach(p => { clampX += p.T + 0.002; });
  for (const side of [-1, 1]) {
    const cl = cyl(0.045, 0.035, M.brass); cl.rotation.z = Math.PI / 2; cl.position.x = side * (clampX + 0.02);
    const lever = box(0.012, 0.06, 0.012, M.brass, side * (clampX + 0.02), 0.06, 0);
    const g = new THREE.Group(); g.add(cl, lever);
    bar.add(g);
    slide(g, 2600 + (side > 0 ? 70 : 0), 300, new THREE.Vector3(side * 0.3, 0, 0), ease.outCubic);
  }

  /* ---------- 5. Flat bench ---------- */
  const bench = new THREE.Group();
  bench.position.set(1.95, 0.03, 0.55);
  bench.rotation.y = -0.42;
  world.add(bench);
  const rail = box(0.08, 0.06, 1.06, M.powder, 0, 0.2, 0);
  const frontLeg = new THREE.Group();
  frontLeg.add(box(0.06, 0.32, 0.06, M.powder, 0, 0.2, 0.48), box(0.5, 0.05, 0.07, M.powder, 0, 0.03, 0.5));
  const rearLeg = new THREE.Group();
  rearLeg.add(box(0.06, 0.32, 0.06, M.powder, 0, 0.2, -0.46), box(0.42, 0.05, 0.07, M.powder, 0, 0.03, -0.5));
  for (const sx of [-0.2, 0.2]) { const w = cyl(0.035, 0.03, M.rubber, 20); w.rotation.z = Math.PI / 2; w.position.set(sx, 0.035, -0.56); rearLeg.add(w); }
  const handle = cyl(0.014, 0.42, M.satin); handle.rotation.x = Math.PI / 2; handle.position.set(0, 0.22, 0.72);
  const pad = rbox(0.3, 0.075, 1.18, 0.03, M.leather); pad.position.set(0, 0.4, 0);
  const board = box(0.27, 0.025, 1.12, M.powderEdge, 0, 0.352, 0);
  const seam = box(0.302, 0.004, 1.17, M.brass, 0, 0.388, 0); seam.castShadow = false;
  const post = box(0.06, 0.12, 0.06, M.powder, 0, 0.29, 0);
  bench.add(rail, frontLeg, rearLeg, handle, board, pad, seam, post);
  slide(bench, 2050, 720, new THREE.Vector3(1.6, 0, 1.1), ease.outQuart);
  tl.add(2050, 720, p => { bench.rotation.y = -0.42 - 0.35 * (1 - ease.outQuart(p)); });

  // A pair of dumbbells resting beside the bench.
  function dumbbell(r: number, len: number) {
    const g = new THREE.Group();
    const hexGeo = geo(new THREE.CylinderGeometry(r, r, len, 6));
    const h = cyl(0.017, 0.14, M.chrome, 16); h.rotation.x = Math.PI / 2;
    g.add(h);
    for (const s of [-1, 1]) {
      const head = mesh(hexGeo, M.rubber); head.rotation.x = Math.PI / 2; head.position.z = s * (0.07 + len / 2);
      const cap = cyl(r * 0.45, 0.004, M.satin, 20); cap.rotation.x = Math.PI / 2; cap.position.z = s * (0.07 + len + 0.002);
      g.add(head, cap);
    }
    return g;
  }
  const benchBells = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const d = dumbbell(0.068, 0.07); d.rotation.y = Math.PI / 2 - 0.35 + i * 0.12; d.position.set(2.3 + i * 0.12, 0.03 + 0.068 * Math.cos(Math.PI / 6), 1.25 + i * 0.26);
    benchBells.add(d);
    drop(d, 2900 + i * 120, 520, 0.9);
  }
  world.add(benchBells);

  /* ---------- 6. Two-tier hex dumbbell rack ---------- */
  const dbRack = new THREE.Group();
  dbRack.position.set(-3.05, 0.03, -3.6);
  dbRack.rotation.y = 0;
  world.add(dbRack);
  const dbFrame = new THREE.Group();
  const DL = 2.3;
  for (const x of [-DL / 2, 0, DL / 2]) {
    const leg = box(0.06, 0.82, 0.06, M.powder, x, 0.41, -0.14);
    const legF = box(0.06, 0.5, 0.06, M.powder, x, 0.25, 0.22);
    const foot = box(0.07, 0.04, 0.62, M.powder, x, 0.02, 0.04);
    dbFrame.add(leg, legF, foot);
  }
  const shelfHi = box(DL + 0.08, 0.035, 0.26, M.powder, 0, 0.78, -0.08); shelfHi.rotation.x = 0.32;
  const shelfLo = box(DL + 0.08, 0.035, 0.3, M.powder, 0, 0.46, 0.2); shelfLo.rotation.x = 0.32;
  dbFrame.add(shelfHi, shelfLo);
  dbRack.add(dbFrame);
  tl.add(2300, 460, p => { show(dbFrame, p); dbFrame.scale.y = Math.max(0.001, ease.outQuart(p)); });
  const tiers = [
    { y: 0.86, z: -0.1, sizes: [0.05, 0.054, 0.058, 0.062, 0.066, 0.07, 0.074] },
    { y: 0.56, z: 0.2, sizes: [0.08, 0.084, 0.088, 0.092, 0.096, 0.1] },
  ];
  let bellIndex = 0;
  tiers.forEach(tier => {
    const step = DL / tier.sizes.length;
    tier.sizes.forEach((r, i) => {
      const d = dumbbell(r, 0.05 + r * 0.55);
      d.rotation.x = 0.32;
      d.position.set(-DL / 2 + step * (i + 0.5), tier.y + r * 0.6, tier.z);
      d.scale.setScalar(0.86);
      dbRack.add(d);
      drop(d, 2500 + bellIndex * 48, 520, 0.8);
      bellIndex++;
    });
  });

  /* ---------- 7. Dual-stack functional trainer ---------- */
  const trainer = new THREE.Group();
  trainer.position.set(-4.7, 0.03, -2.4);
  trainer.rotation.y = 0.35;
  world.add(trainer);
  const TW = 1.7;
  for (const s of [-1, 1]) {
    const tower = new THREE.Group();
    tower.position.x = s * TW / 2;
    tower.add(box(0.1, 2.25, 0.1, M.powder, 0, 1.125, 0.18), box(0.1, 2.25, 0.1, M.powder, 0, 1.125, -0.22), box(0.42, 0.06, 0.62, M.powder, 0, 0.03, 0), box(0.1, 0.08, 0.5, M.powder, 0, 2.2, 0));
    for (const gx of [-0.06, 0.06]) { const rod = cyl(0.009, 2.0, M.chrome, 12); rod.position.set(gx, 1.08, -0.02); tower.add(rod); }
    const shroud = box(0.34, 1.05, 0.02, M.alu, 0, 1.38, 0.13);
    shroud.material = M.powderEdge;
    tower.add(shroud);
    trainer.add(tower);
    grow(tower, 2650 + (s > 0 ? 90 : 0), 520);
    const stack = new THREE.Group();
    stack.position.x = s * TW / 2;
    for (let k = 0; k < 14; k++) {
      const plate = box(0.24, 0.032, 0.16, k === 13 ? M.satin : M.powderEdge, 0, 0.08 + k * 0.034, -0.02);
      stack.add(plate);
      drop(plate, 2900 + k * 34 + (s > 0 ? 40 : 0), 300, 0.5, ease.outCubic);
    }
    trainer.add(stack);
    const carriage = new THREE.Group();
    carriage.position.set(s * (TW / 2 - 0.02), 1.3, 0.3);
    const pulley = mesh(geo(new THREE.TorusGeometry(0.045, 0.014, 12, 28)), M.powderEdge); pulley.rotation.y = Math.PI / 2;
    const cable = cyl(0.004, 0.5, M.cable, 6); cable.position.set(0, -0.28, 0.02);
    const handleD = mesh(geo(new THREE.TorusGeometry(0.06, 0.009, 10, 24, Math.PI)), M.cable); handleD.position.set(0, -0.55, 0.02); handleD.rotation.z = Math.PI;
    carriage.add(pulley, cable, handleD, box(0.12, 0.2, 0.06, M.powder, 0, 0.1, -0.02));
    trainer.add(carriage);
    drop(carriage, 3200 + (s > 0 ? 60 : 0), 420, 0.6);
  }
  const trainerTop = box(TW + 0.1, 0.1, 0.1, M.powder, 0, 2.2, -0.02);
  const chin = cyl(0.016, TW, M.satin); chin.rotation.z = Math.PI / 2; chin.position.set(0, 2.08, 0.32);
  const topG = new THREE.Group(); topG.add(trainerTop, chin);
  trainer.add(topG);
  drop(topG, 3080, 420, 0.5);

  /* ---------- 8. Cardio row beneath the windows ---------- */
  function treadmill() {
    const g = new THREE.Group();
    const deck = rbox(0.82, 0.2, 1.95, 0.04, M.powderEdge); deck.position.y = 0.16;
    const belt = box(0.56, 0.02, 1.6, M.belt, 0, 0.27, 0.05);
    const railL = box(0.12, 0.03, 1.7, M.alu, -0.34, 0.27, 0.05), railR = box(0.12, 0.03, 1.7, M.alu, 0.34, 0.27, 0.05);
    const motor = rbox(0.82, 0.3, 0.32, 0.05, M.powderEdge); motor.position.set(0, 0.22, -0.98);
    const uprL = box(0.06, 1.1, 0.08, M.powder, -0.36, 0.78, -0.92); uprL.rotation.x = -0.18;
    const uprR = box(0.06, 1.1, 0.08, M.powder, 0.36, 0.78, -0.92); uprR.rotation.x = -0.18;
    const armL = box(0.04, 0.04, 0.5, M.alu, -0.36, 1.12, -0.72), armR = box(0.04, 0.04, 0.5, M.alu, 0.36, 1.12, -0.72);
    const consoleBody = rbox(0.8, 0.36, 0.1, 0.03, M.powderEdge); consoleBody.position.set(0, 1.42, -1.03); consoleBody.rotation.x = 0.35;
    const screen = box(0.5, 0.26, 0.012, M.screen, 0, 1.43, -0.975); screen.rotation.x = 0.35; screen.castShadow = false;
    g.add(deck, belt, railL, railR, motor, uprL, uprR, armL, armR, consoleBody, screen);
    return g;
  }
  for (let i = 0; i < 3; i++) {
    const t = treadmill();
    t.position.set(1.95 + i * 1.1, 0.03, -2.75);
    world.add(t);
    slide(t, 2850 + i * 140, 680, new THREE.Vector3(0, 0, -2.4), ease.outQuart);
  }

  /* ---------- 9. Linear pendant lighting ---------- */
  const fixtures: { bar: THREE.Group; light: THREE.RectAreaLight }[] = [];
  const pendantZs = [-3.1, -1.15, 0.8];
  pendantZs.forEach((z, i) => {
    const x = 0.4;
    const g = new THREE.Group();
    g.position.set(x, 3.55, z);
    const housing = box(5.2, 0.06, 0.08, M.lightBar, 0, 0, 0); housing.castShadow = false;
    const diffuser = box(5.15, 0.012, 0.06, M.diffuser, 0, -0.034, 0); diffuser.castShadow = false;
    const w1 = cyl(0.002, 0.6, M.cable, 4), w2 = cyl(0.002, 0.6, M.cable, 4);
    w1.position.set(-2.2, 0.32, 0); w2.position.set(2.2, 0.32, 0);
    g.add(housing, diffuser, w1, w2);
    world.add(g);
    drop(g, 3350 + i * 90, 520, -0.8, ease.outQuart);
    const ra = new THREE.RectAreaLight('#fff', 0, 5.1, 0.12);
    ra.position.set(x, 3.5, z);
    ra.lookAt(x, 0, z);
    scene.add(ra);
    fixtures.push({ bar: g, light: ra });
  });

  /* ---------- 10. Aureon chevron (source glyph path M2.5 20.2 12 1.8l9.5 18.4) ---------- */
  const s = 0.05;
  const chevronOrigin = new THREE.Vector3(-3.05, 1.55, wallZ + 0.12);
  const pts = [[2.5, 20.2], [12, 1.8], [21.5, 20.2]].map(([x, y]) => new THREE.Vector3(chevronOrigin.x + (x - 12) * s, chevronOrigin.y + (22 - y) * s, chevronOrigin.z));
  const chevPath = new THREE.CurvePath<THREE.Vector3>();
  chevPath.add(new THREE.LineCurve3(pts[0], pts[1]));
  chevPath.add(new THREE.LineCurve3(pts[1], pts[2]));
  const chevGeo = geo(new THREE.TubeGeometry(chevPath, 160, 0.016, 10, false));
  const chevron = mesh(chevGeo, M.chevron, false, false);
  world.add(chevron);
  const chevIndexCount = chevGeo.index!.count;
  const brandLight = new THREE.PointLight('#ffb35a', 0, 4.2, 1.6);
  brandLight.position.set(chevronOrigin.x, chevronOrigin.y + 0.55, wallZ + 0.45);
  scene.add(brandLight);
  tl.add(3900, 650, p => {
    chevron.visible = p > 0;
    const e = ease.inOutCubic(p);
    chevGeo.setDrawRange(0, Math.floor((chevIndexCount / 6) * e) * 6);
  });

  /* ---------- Lighting rig ---------- */
  const hemi = new THREE.HemisphereLight('#fff', '#000', 0.2);
  scene.add(hemi);
  const key = new THREE.SpotLight('#fff', 0, 22, 0.62, 0.75, 1.2);
  key.position.set(1.6, 6.8, 3.8);
  key.target.position.set(0.6, 0, -1.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  key.shadow.camera.near = 2; key.shadow.camera.far = 16;
  scene.add(key, key.target);
  const wallWash = new THREE.RectAreaLight('#ffb766', 0, 26, 0.25);
  wallWash.position.set(0, 0.25, wallZ + 0.3);
  wallWash.lookAt(0, 1.5, wallZ - 2);
  scene.add(wallWash);

  let lightsOn = 0, brandOn = 0;
  tl.add(0, 3200, p => { lightsOn = 0.0 * p; });
  tl.add(3350, 900, p => { lightsOn = ease.inOutSine(p); });
  tl.add(4100, 700, p => { brandOn = ease.inOutSine(p); });

  function applyLook() {
    const L = LOOKS[theme];
    scene.background = new THREE.Color(L.background);
    const fog = scene.fog as THREE.Fog;
    fog.color.set(L.background); fog.near = L.fog[0]; fog.far = L.fog[1];
    M.floor.color.set(L.floor); M.floorBase.color.set(L.floorBase);
    M.wall.color.set(L.wall); M.slat.color.set(L.slat); M.ceiling.color.set(L.ceiling);
    M.glass.color.set(L.glass); M.glass.emissive.set(L.glassEmissive); M.glass.emissiveIntensity = L.glassEmissiveIntensity;
    scene.environmentIntensity = L.env;
    renderer.toneMappingExposure = L.exposure;
    hemi.color.set(L.hemiSky); hemi.groundColor.set(L.hemiGround);
    hemi.intensity = lerp(L.hemi[0], L.hemi[1], lightsOn);
    key.color.set(L.keyColor); key.intensity = lerp(L.key[0], L.key[1], lightsOn);
    fixtures.forEach(({ light }, i) => {
      const local = clamp01(lightsOn * 1.6 - i * 0.18);
      light.color.set(L.barColor);
      light.intensity = lerp(L.bar[0], L.bar[1], local);
    });
    M.diffuser.emissiveIntensity = lerp(L.barEmissive[0], L.barEmissive[1], lightsOn);
    M.cove.emissiveIntensity = lerp(0, 3.2, lightsOn);
    wallWash.intensity = lerp(L.cove[0], L.cove[1], lightsOn);
    M.chevron.emissiveIntensity = lerp(0, 2.4, brandOn);
    brandLight.intensity = lerp(L.brand[0], L.brand[1], brandOn);
    M.screen.emissiveIntensity = lerp(0, 1.4, lightsOn);
  }

  /* ---------- Camera ---------- */
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
  let camProgress = 0;
  tl.add(0, ASSEMBLY_MS, p => { camProgress = p; });
  function applyCamera() {
    if (options.shot) {
      const S = SHOTS[options.shot];
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      camera.fov = S.fov; camera.aspect = w / h;
      camera.position.copy(S.pos); camera.lookAt(S.look);
      camera.clearViewOffset(); camera.updateProjectionMatrix();
      return;
    }
    const C = CAMERAS[layout];
    const e = ease.inOutCubic(camProgress) * 0.35 + ease.outCubic(camProgress) * 0.65;
    camPos.lerpVectors(C.from, C.to, e);
    camLook.lerpVectors(C.lookFrom, C.look, e);
    camera.fov = C.fov;
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    camera.aspect = w / h;
    camera.setViewOffset(w, h, C.shift[0] * w, C.shift[1] * h, w, h);
    camera.updateProjectionMatrix();
  }

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    layout = w / h < 0.9 || w < 720 ? 'mobile' : 'desktop';
    const dpr = Math.min(window.devicePixelRatio || 1, layout === 'mobile' ? 1.6 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
  }

  let clock = 0, startTime = -1, raf = 0, settled = false, firstFrame = false, disposed = false;
  function frame(now: number) {
    if (disposed) return;
    if (startTime < 0) startTime = now;
    clock = options.freezeAt ?? (options.instant ? tl.end : now - startTime);
    renderAt(clock);
    if (!firstFrame) { firstFrame = true; options.onFirstFrame?.(); }
    if (options.freezeAt !== undefined) { raf = 0; return; }
    if (clock >= tl.end) {
      if (!settled) { settled = true; options.onSettled?.(); }
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(frame);
  }
  function renderAt(ms: number) {
    tl.seek(ms);
    applyLook();
    applyCamera();
    renderer.render(scene, camera);
  }
  function requestRender() {
    if (raf || disposed) return;
    if (settled) renderAt(tl.end);
  }

  resize();
  applyLook();
  tl.seek(0);
  raf = requestAnimationFrame(frame);

  return {
    setTheme(next) { theme = next; requestRender(); },
    resize() { resize(); requestRender(); },
    capture(type = 'image/webp', quality = 0.86) {
      renderAt(options.freezeAt ?? tl.end);
      return canvas.toDataURL(type, quality);
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      disposables.forEach(d => d.dispose());
      scene.traverse(o => { if (o instanceof THREE.InstancedMesh) o.dispose(); });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
