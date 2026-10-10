import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Timeline, clamp01, ease, lerp } from '@/lib/motion';

/*
 * Aureon hero: a real-time, physically lit strength-training floor that assembles
 * object by object. Every piece is modelled in code to real-world dimensions (metres):
 * IWF-proportioned barbell and bumper plates, 2.3 m power rack, flat bench, hex dumbbell
 * rack, kettlebells, dual-stack functional trainer and treadmills. Surface maps are CC0
 * scans from ambientCG (see docs/ASSET-LICENSES.md); everything else is generated here.
 */

export type HeroTheme = 'dark' | 'light';
export type HeroLayout = 'desktop' | 'mobile';
export type HeroShot = 'plates' | 'bench' | 'trainer' | 'entrance' | 'ceiling';
const SHOTS: Record<HeroShot, { fov: number; pos: THREE.Vector3; look: THREE.Vector3 }> = {
  plates: { fov: 30, pos: new THREE.Vector3(2.0, 1.62, 0.9), look: new THREE.Vector3(0.62, 1.42, -0.5) },
  bench: { fov: 34, pos: new THREE.Vector3(3.7, 1.15, 2.8), look: new THREE.Vector3(2.0, 0.45, 0.6) },
  trainer: { fov: 44, pos: new THREE.Vector3(-1.7, 1.45, 1.8), look: new THREE.Vector3(-4.4, 1.15, -2.5) },
  entrance: { fov: 46, pos: new THREE.Vector3(0.9, 1.55, 6.6), look: new THREE.Vector3(0.4, 1.35, -1.6) },
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
const TEX = '/assets/hero/tex/';

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gravity drop: accelerates from rest, makes contact at 62%, then one short damped rebound. */
const land = (t: number) => {
  if (t < 0.62) { const u = t / 0.62; return u * u; }
  const u = (t - 0.62) / 0.38;
  return 1 - 0.045 * Math.abs(Math.sin(u * Math.PI * 2)) * Math.exp(-4.5 * u);
};

function canvasTexture(c: HTMLCanvasElement, srgb = true) {
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Low-frequency wear for the rubber floor: smoother, shinier traffic patches. */
function wearTexture() {
  const size = 256, c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = '#e0e0e0'; g.fillRect(0, 0, size, size);
  const r = rng(19);
  for (let i = 0; i < 90; i++) {
    const v = 150 + Math.floor(r() * 90);
    g.fillStyle = `rgba(${v},${v},${v},0.16)`;
    const x = r() * size, y = r() * size, w = 20 + r() * 90, h = 12 + r() * 60, a = r() * 3;
    // Drawn at every wrap offset so the map tiles without seams.
    for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) {
      g.beginPath(); g.ellipse(x + dx, y + dy, w, h, a, 0, Math.PI * 2); g.fill();
    }
  }
  const tex = canvasTexture(c, false);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Diamond knurl for the bar shaft (bump only). */
function knurlTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff'; g.fillRect(0, 0, 32, 32);
  g.strokeStyle = '#000'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(32, 32); g.moveTo(32, 0); g.lineTo(0, 32); g.stroke();
  const tex = canvasTexture(c, false);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 70);
  return tex;
}

/** Bumper plate face: moulded weight lettering on the label band of the lathe profile (rows 2–3 of 13). */
function plateTexture(label: string) {
  const W = 1024, rows = 13, rowH = 40, H = rows * rowH, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#1c1d1d'; g.fillRect(0, 0, W, H);
  // Outer rim faces read as slightly worn rubber.
  g.fillStyle = '#232424'; g.fillRect(0, H - 7 * rowH, W, rowH * 2);
  const band = H - 3 * rowH;
  g.fillStyle = '#9a9a94';
  g.font = `700 ${rowH * 0.78}px "Segoe UI", Arial, sans-serif`;
  g.textBaseline = 'middle';
  for (const u of [0.04, 0.54]) {
    g.textAlign = 'left';
    g.fillText(label, u * W, band + rowH / 2);
  }
  g.fillStyle = '#6f706c';
  for (const u of [0.32, 0.82]) g.fillRect(u * W, band + rowH * 0.42, 70, rowH * 0.16);
  const tex = canvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

/** Neutral treadmill console UI (no product branding: Aureon does not supply equipment). */
function consoleTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#04100d'; g.fillRect(0, 0, 256, 128);
  g.strokeStyle = '#2f8f7a'; g.lineWidth = 6;
  g.beginPath(); g.arc(70, 64, 34, Math.PI * 0.8, Math.PI * 2.2); g.stroke();
  g.fillStyle = '#5fd0b4';
  for (let i = 0; i < 9; i++) { const h = 10 + ((i * 37) % 40); g.fillRect(130 + i * 12, 96 - h, 7, h); }
  g.fillRect(130, 26, 96, 6); g.fillStyle = '#2f8f7a'; g.fillRect(130, 38, 60, 4);
  return canvasTexture(c);
}

/** Exterior seen through the window band: layered street of buildings in atmospheric haze, dusk or daylight. */
function exteriorTexture(theme: HeroTheme) {
  const W = 2048, H = 768, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  const dark = theme === 'dark';
  const sky = g.createLinearGradient(0, 0, 0, H);
  if (dark) { sky.addColorStop(0, '#0b151d'); sky.addColorStop(0.5, '#172833'); sky.addColorStop(0.8, '#2f3b40'); sky.addColorStop(1, '#3b3631'); }
  else { sky.addColorStop(0, '#c4d3d8'); sky.addColorStop(0.55, '#dfe6e4'); sky.addColorStop(1, '#efede6'); }
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const r = rng(dark ? 3 : 4);
  const horizon = H * 0.84;
  const layers = dark
    ? [{ tone: '#1c2a32', win: 0.12, a: 0.2, blur: 1.6, hMin: 260, hVar: 220, wMin: 120 }, { tone: '#121c22', win: 0.17, a: 0.34, blur: 0.9, hMin: 150, hVar: 200, wMin: 90 }, { tone: '#0a1014', win: 0.22, a: 0.45, blur: 0.5, hMin: 70, hVar: 120, wMin: 140 }]
    : [{ tone: '#d6dcd9', win: 1, a: 0.06, blur: 2.2, hMin: 260, hVar: 220, wMin: 120 }, { tone: '#c9cfcb', win: 1, a: 0.1, blur: 1.2, hMin: 150, hVar: 200, wMin: 90 }, { tone: '#bcc2bd', win: 1, a: 0.12, blur: 0.6, hMin: 70, hVar: 120, wMin: 140 }];
  // Each depth layer is drawn on its own canvas and composited once with its blur (per-rect filters stall the CPU).
  const layer = document.createElement('canvas');
  layer.width = W; layer.height = H;
  const lg = layer.getContext('2d')!;
  for (const L of layers) {
    lg.clearRect(0, 0, W, H);
    let x = -30;
    while (x < W) {
      const w = L.wMin + r() * 160, h = L.hMin + r() * L.hVar, top = horizon - h;
      lg.fillStyle = L.tone; lg.fillRect(x, top, w, h + 6);
      const cw = 4, ch = 5, gx = 3, gy = 6;
      for (let wx = x + 8; wx < x + w - cw - 6; wx += cw + gx) for (let wy = top + 10; wy < horizon - ch - 6; wy += ch + gy) {
        if (r() > L.win) continue;
        if (dark) lg.fillStyle = `rgba(255,${196 + Math.floor(r() * 40)},${130 + Math.floor(r() * 60)},${L.a * (0.4 + r() * 0.6)})`;
        else lg.fillStyle = `rgba(60,76,82,${L.a * (0.6 + r() * 0.6)})`;
        lg.fillRect(wx, wy, cw, ch);
      }
      x += w + 4 + r() * 30;
    }
    g.filter = `blur(${L.blur}px)`; g.drawImage(layer, 0, 0); g.filter = 'none';
    // Atmospheric haze between depth layers.
    const haze = g.createLinearGradient(0, horizon - 420, 0, horizon);
    haze.addColorStop(0, dark ? 'rgba(47,59,64,0)' : 'rgba(233,236,231,0)');
    haze.addColorStop(1, dark ? 'rgba(47,59,64,0.32)' : 'rgba(233,236,231,0.5)');
    g.fillStyle = haze; g.fillRect(0, 0, W, horizon);
  }
  lg.clearRect(0, 0, W, H);
  lg.fillStyle = dark ? '#070b0a' : '#8e9a87';
  for (let x = 0; x < W; x += 14) { const h = 26 + Math.sin(x * 0.021) * 8 + r() * 10; lg.fillRect(x, horizon - h, 16, h + 30); }
  g.filter = 'blur(1.5px)'; g.drawImage(layer, 0, 0); g.filter = 'none';
  g.fillStyle = dark ? '#151816' : '#d3cfc4'; g.fillRect(0, horizon + 6, W, H);
  if (dark) for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(255,214,160,${0.35 + r() * 0.4})`; g.fillRect(r() * W, horizon - 40 - r() * 8, 2, 2); }
  return canvasTexture(c);
}

interface ThemeLook {
  background: string; fog: [number, number];
  floor: string; floorBase: string; wall: string; slat: string; ceiling: string; outside: string;
  env: number; exposure: number;
  hemiSky: string; hemiGround: string; hemi: [number, number];
  key: [number, number, number]; keyColor: string;
  rim: number; rimColor: string;
  sun: number; window: number; windowColor: string;
  bar: number; barColor: string; barEmissive: number;
  cove: number; brand: number; bloom: number;
}

const LOOKS: Record<HeroTheme, ThemeLook> = {
  dark: {
    background: '#0b100e', fog: [14, 34],
    floor: '#6a6d69', floorBase: '#0c0d0d', wall: '#3a3f3c', slat: '#7a624a', ceiling: '#161a19', outside: '#3a3d3a',
    env: 0.22, exposure: 1.05,
    hemiSky: '#8fa3b0', hemiGround: '#14110d', hemi: [0.05, 0.22],
    key: [24, 30, 42], keyColor: '#ffdcb0',
    rim: 34, rimColor: '#a9c5d8',
    sun: 0, window: 1.4, windowColor: '#7d9db4',
    bar: 13, barColor: '#ffd8a6', barEmissive: 7,
    cove: 2.4, brand: 3.2, bloom: 0.42,
  },
  light: {
    background: '#e7e2d7', fog: [16, 40],
    floor: '#c4c2bb', floorBase: '#8e8c86', wall: '#ece7dc', slat: '#efe3d0', ceiling: '#f0ece3', outside: '#d8d3c6',
    env: 0.42, exposure: 0.92,
    hemiSky: '#fbf6ec', hemiGround: '#7a7266', hemi: [0.25, 0.55],
    key: [10, 12, 14], keyColor: '#fff2df',
    rim: 10, rimColor: '#fff6e6',
    sun: 6.2, window: 3.2, windowColor: '#eef3f5',
    bar: 3.2, barColor: '#fff1dc', barEmissive: 2.4,
    cove: 0.9, brand: 1.3, bloom: 0.18,
  },
};

interface CameraPath { fov: number; from: THREE.Vector3; via: THREE.Vector3; to: THREE.Vector3; lookFrom: THREE.Vector3; look: THREE.Vector3; shift: [number, number] }
const CAMERAS: Record<HeroLayout, CameraPath> = {
  desktop: {
    fov: 33,
    from: new THREE.Vector3(1.55, 1.42, 2.75), via: new THREE.Vector3(3.2, 1.5, 4.9), to: new THREE.Vector3(4.05, 1.52, 7.7),
    lookFrom: new THREE.Vector3(-0.1, 1.32, -1.15), look: new THREE.Vector3(0.55, 1.52, -1.6),
    shift: [-0.2, 0.14],
  },
  mobile: {
    fov: 50,
    from: new THREE.Vector3(1.2, 1.5, 4.3), via: new THREE.Vector3(2.0, 1.58, 6.4), to: new THREE.Vector3(2.4, 1.6, 8.9),
    lookFrom: new THREE.Vector3(0.0, 1.35, -1.15), look: new THREE.Vector3(0.35, 1.62, -1.3),
    shift: [0.02, -0.21],
  },
};

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, res: { value: new THREE.Vector2(1, 1) }, vignette: { value: 0.22 }, grain: { value: 0.022 }, shadowTint: { value: new THREE.Color('#e9f1ef') }, highTint: { value: new THREE.Color('#fff7ea') } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform vec2 res; uniform float vignette; uniform float grain; uniform vec3 shadowTint; uniform vec3 highTint;
    varying vec2 vUv;
    float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    void main(){
      vec2 d = vUv - 0.5;
      vec2 off = d * dot(d, d) * 0.004;
      vec3 c = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c *= mix(shadowTint, highTint, smoothstep(0.05, 0.75, l));
      c *= 1.0 - vignette * smoothstep(0.35, 1.05, length(d * vec2(1.25, 1.0)) * 1.25);
      c += (hash(vUv * res) - 0.5) * grain;
      gl_FragColor = vec4(c, 1.0);
    }`,
};

/** Planar world-space UVs, so maps stay continuous and at true scale across tiles, slats and walls. */
function worldMapped<T extends THREE.MeshStandardMaterial>(m: T): T {
  m.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace('#include <uv_vertex>', `
      vec4 aurW = vec4(position, 1.0);
      #ifdef USE_INSTANCING
        aurW = instanceMatrix * aurW;
      #endif
      aurW = modelMatrix * aurW;
      vec3 aurN = abs(normalize(mat3(modelMatrix) * normal));
      vec2 uv = aurN.y > 0.5 ? aurW.xz : (aurN.x > 0.5 ? aurW.zy : aurW.xy);
      #include <uv_vertex>`);
  };
  m.customProgramCacheKey = () => 'aureon-world-uv';
  return m;
}

export function createGymScene(canvas: HTMLCanvasElement, options: GymSceneOptions): GymSceneApi {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
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

  /* ---------- Surface maps (CC0 ambientCG scans, 512 px WebP) ---------- */
  let markLoaded = () => {};
  const texReady = new Promise<void>(resolve => { markLoaded = resolve; setTimeout(resolve, 5000); });
  const loader = new THREE.TextureLoader(new THREE.LoadingManager(() => markLoaded(), undefined, () => markLoaded()));
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const map = (file: string, srgb: boolean, repeat: number) => {
    const t = track(loader.load(TEX + file));
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.anisotropy = maxAniso;
    return t;
  };
  const floorMaps: Partial<Record<HeroTheme, THREE.Texture>> = {};
  const floorMap = (t: HeroTheme) => (floorMaps[t] ??= map(t === 'dark' ? 'rubber-color.webp' : 'rubber-light-color.webp', true, 0.55));
  const rubberColor = floorMap('dark'), rubberNormal = map('rubber-normal.webp', false, 0.55);
  const leatherNormal = map('rubber-normal.webp', false, 1); leatherNormal.repeat.set(1.4, 5);
  const concreteColor = map('concrete-color.webp', true, 0.3), concreteNormal = map('concrete-normal.webp', false, 0.3);
  const oakColor = map('oak-color.webp', true, 0.9), oakRough = map('oak-rough.webp', false, 0.9);
  const outsideColor = map('concrete-color.webp', true, 0.18);
  const wear = track(wearTexture()); wear.repeat.set(1 / 7, 1 / 7);
  const knurl = track(knurlTexture());
  const consoleMap = track(consoleTexture());
  const exterior: Partial<Record<HeroTheme, THREE.Texture>> = {};
  const exteriorMap = (t: HeroTheme) => (exterior[t] ??= track(exteriorTexture(t)));

  /* ---------- Materials ---------- */
  const M = {
    floor: track(worldMapped(new THREE.MeshStandardMaterial({ map: floorMap(options.theme), normalMap: rubberNormal, normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.95, roughnessMap: wear, metalness: 0 }))),
    floorBase: track(new THREE.MeshStandardMaterial({ roughness: 0.95 })),
    wall: track(worldMapped(new THREE.MeshStandardMaterial({ map: concreteColor, normalMap: concreteNormal, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.9 }))),
    slat: track(worldMapped(new THREE.MeshStandardMaterial({ map: oakColor, roughnessMap: oakRough, roughness: 0.75 }))),
    oak: track(worldMapped(new THREE.MeshStandardMaterial({ map: oakColor, roughnessMap: oakRough, roughness: 0.6, color: '#d9c3a3' }))),
    ceiling: track(new THREE.MeshStandardMaterial({ roughness: 0.92 })),
    outside: track(worldMapped(new THREE.MeshStandardMaterial({ map: outsideColor, roughness: 0.9 }))),
    glass: track(new THREE.MeshPhysicalMaterial({ color: '#cfd8d6', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.12, envMapIntensity: 1.6, depthWrite: false })),
    sky: track(new THREE.MeshBasicMaterial({ map: exteriorMap(options.theme), fog: false, transparent: true, toneMapped: true })),
    powder: track(new THREE.MeshPhysicalMaterial({ color: '#1a1d1c', roughness: 0.5, metalness: 0.05, clearcoat: 0.3, clearcoatRoughness: 0.42 })),
    powderEdge: track(new THREE.MeshPhysicalMaterial({ color: '#2b2f2d', roughness: 0.42, metalness: 0.1, clearcoat: 0.2, clearcoatRoughness: 0.4 })),
    frame: track(new THREE.MeshStandardMaterial({ color: '#202422', roughness: 0.55, metalness: 0.3 })),
    hole: track(new THREE.MeshBasicMaterial({ color: '#030404' })),
    chrome: track(new THREE.MeshPhysicalMaterial({ color: '#e6e6e3', roughness: 0.16, metalness: 1, anisotropy: 0.5 })),
    satin: track(new THREE.MeshStandardMaterial({ color: '#b5b6b2', roughness: 0.34, metalness: 1, bumpMap: knurl, bumpScale: 0.6 })),
    steel: track(new THREE.MeshStandardMaterial({ color: '#9fa19d', roughness: 0.3, metalness: 1 })),
    bolt: track(new THREE.MeshStandardMaterial({ color: '#77797a', roughness: 0.38, metalness: 1 })),
    rubber: track(new THREE.MeshStandardMaterial({ color: '#141515', roughness: 0.8, metalness: 0 })),
    rubberSoft: track(worldMapped(new THREE.MeshStandardMaterial({ map: rubberColor, normalMap: rubberNormal, color: '#3a3b3a', roughness: 0.88, metalness: 0 }))),
    brass: track(new THREE.MeshPhysicalMaterial({ color: '#a8804a', roughness: 0.32, metalness: 1, clearcoat: 0.3 })),
    leather: track(new THREE.MeshPhysicalMaterial({ color: '#1b1a19', roughness: 0.55, metalness: 0, normalMap: leatherNormal, normalScale: new THREE.Vector2(0.35, 0.35), sheen: 0.5, sheenRoughness: 0.5, sheenColor: new THREE.Color('#6b5a45') })),
    piping: track(new THREE.MeshStandardMaterial({ color: '#2c2a27', roughness: 0.5 })),
    uhmw: track(new THREE.MeshStandardMaterial({ color: '#0c0c0c', roughness: 0.5 })),
    screen: track(new THREE.MeshStandardMaterial({ color: '#030605', roughness: 0.12, metalness: 0.1, emissive: new THREE.Color('#ffffff'), emissiveMap: consoleMap, emissiveIntensity: 0 })),
    belt: track(new THREE.MeshStandardMaterial({ color: '#111212', roughness: 0.92 })),
    alu: track(new THREE.MeshStandardMaterial({ color: '#8c8f8d', roughness: 0.4, metalness: 0.9 })),
    lightBar: track(new THREE.MeshStandardMaterial({ color: '#151716', roughness: 0.45, metalness: 0.6 })),
    diffuser: track(new THREE.MeshStandardMaterial({ color: '#fff3df', emissive: new THREE.Color('#ffd9a8'), emissiveIntensity: 0, roughness: 0.6 })),
    cove: track(new THREE.MeshStandardMaterial({ color: '#2a2016', emissive: new THREE.Color('#ffb85c'), emissiveIntensity: 0 })),
    chevron: track(new THREE.MeshStandardMaterial({ color: '#c8913c', metalness: 0.9, roughness: 0.25, emissive: new THREE.Color('#ffb24f'), emissiveIntensity: 0 })),
    cable: track(new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.45 })),
    iron: track(new THREE.MeshStandardMaterial({ color: '#202221', roughness: 0.62, metalness: 0.55 })),
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
  /** Steel tube with a real corner radius (no razor edges). */
  const tube = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0, r = 0.006) => {
    const o = mesh(geo(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2))), m);
    o.position.set(x, y, z);
    return o;
  };
  const cyl = (r: number, len: number, m: THREE.Material, seg = 32) => mesh(geo(new THREE.CylinderGeometry(r, r, len, seg)), m);
  const pivot = (child: THREE.Object3D, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.add(child);
    return g;
  };
  const boltGeo = geo(new THREE.CylinderGeometry(0.0095, 0.0095, 0.008, 6));
  /** Hex bolt head on a face pointing along `axis`. */
  const bolt = (x: number, y: number, z: number, axis: 'x' | 'z') => {
    const b = mesh(boltGeo, M.bolt, false, true);
    b.position.set(x, y, z);
    if (axis === 'z') b.rotation.x = Math.PI / 2; else b.rotation.z = Math.PI / 2;
    return b;
  };

  const tl = new Timeline();
  const world = new THREE.Group();
  scene.add(world);

  /* ---------- Shared tween helpers ---------- */
  const show = (o: THREE.Object3D, p: number) => { o.visible = p > 0; };
  function grow(o: THREE.Object3D, start: number, dur: number, easing = ease.outQuart) {
    tl.add(start, dur, p => { show(o, p); o.scale.y = Math.max(0.0001, easing(p)); });
  }
  function drop(o: THREE.Object3D, start: number, dur: number, height = 1.2, easing: (t: number) => number = land) {
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

  /* ---------- 1. Foundation: an empty floor under a single work light, then the lifting platform ---------- */
  const floorBase = mesh(geo(new THREE.PlaneGeometry(60, 26)), M.floorBase, false, true);
  floorBase.rotation.x = -Math.PI / 2;
  floorBase.position.set(0, -0.002, 8.6);
  world.add(floorBase);

  const platform = new THREE.Group();
  const plat = tube(2.6, 0.04, 2.6, M.rubberSoft, 0, 0.02, 0, 0.008); plat.castShadow = false;
  const oak = tube(1.0, 0.042, 2.56, M.oak, 0, 0.021, 0, 0.004); oak.castShadow = false;
  const oakEdge = [-1, 1].map(s => box(0.012, 0.043, 2.56, M.frame, s * 0.506, 0.0215, 0));
  platform.add(plat, oak, ...oakEdge);
  platform.position.set(0, 0.03, -1.15);
  world.add(platform);
  drop(platform, 80, 460, 0.32);

  // Rubber tiles seat outward from the platform; one continuous world-mapped surface, hairline seams.
  const tileGeo = geo(new THREE.BoxGeometry(0.9985, 0.03, 0.9985));
  const tilesX = 24, tilesZ = 13, tileOrigin = new THREE.Vector3(-13 + 0.5, 0.015, -4.4 + 0.5);
  const tiles = new THREE.InstancedMesh(tileGeo, M.floor, tilesX * tilesZ);
  tiles.receiveShadow = true;
  const tileData: { x: number; z: number; delay: number }[] = [];
  const centre = new THREE.Vector2(0, -1.15);
  for (let ix = 0; ix < tilesX; ix++) for (let iz = 0; iz < tilesZ; iz++) {
    const x = tileOrigin.x + ix, z = tileOrigin.z + iz;
    tileData.push({ x, z, delay: new THREE.Vector2(x, z).distanceTo(centre) * 70 });
  }
  const tm = new THREE.Matrix4(), tq = new THREE.Quaternion(), ts = new THREE.Vector3(), tp = new THREE.Vector3();
  tl.add(200, 1500, p => {
    const ms = p * 1500;
    tiles.visible = p > 0;
    tileData.forEach((t, i) => {
      const k = clamp01((ms - t.delay) / 320);
      const e = ease.outCubic(k);
      tp.set(t.x, tileOrigin.y - 0.05 * (1 - e) + (k > 0 ? 0 : -1), t.z);
      ts.set(1, k > 0 ? Math.max(0.01, e) : 0.001, 1);
      tm.compose(tp, tq, ts);
      tiles.setMatrixAt(i, tm);
    });
    tiles.instanceMatrix.needsUpdate = true;
  });
  world.add(tiles);

  /* ---------- 2. Power rack: the first recognisable silhouette, rising inside the work light ---------- */
  const rack = new THREE.Group();
  rack.position.set(0, 0.07, -1.15);
  world.add(rack);
  const RW = 1.22 / 2, RD = 1.2 / 2, RH = 2.3, U = 0.075;
  const holeGeo = geo(new THREE.BoxGeometry(0.022, 0.022, 0.004));
  [[-RW, RD], [RW, RD], [-RW, -RD], [RW, -RD]].forEach(([x, z], i) => {
    const post = tube(U, RH, U, M.powder, 0, RH / 2, 0, 0.007);
    const g = pivot(post, x, 0, z);
    const holes = new THREE.InstancedMesh(holeGeo, M.hole, 2 * 36);
    let n = 0;
    const sq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    for (let k = 0; k < 36; k++) {
      const y = 0.42 + k * 0.05;
      tm.compose(tp.set(0, y, (z > 0 ? 1 : -1) * (U / 2 + 0.0015)), tq, ts.set(1, 1, 1)); holes.setMatrixAt(n++, tm);
      tm.compose(tp.set((x > 0 ? 1 : -1) * (U / 2 + 0.0015), y, 0), sq, ts.set(1, 1, 1)); holes.setMatrixAt(n++, tm);
    }
    g.add(holes);
    g.add(tube(0.16, 0.012, 0.16, M.powderEdge, 0, 0.006, 0, 0.003));
    // Through-bolts where the crossmembers meet the upright.
    const fz = (z > 0 ? 1 : -1) * (U / 2 + 0.004);
    g.add(bolt(-0.02, RH - 0.04, fz, 'z'), bolt(0.02, RH - 0.04, fz, 'z'), bolt(-0.02, 0.03, fz, 'z'), bolt(0.02, 0.03, fz, 'z'));
    rack.add(g);
    grow(g, 240 + i * 85, 480, ease.outQuart);
  });
  const rackTop = new THREE.Group();
  rackTop.add(
    tube(RW * 2 + U, U, U, M.powder, 0, RH - U / 2, RD), tube(RW * 2 + U, U, U, M.powder, 0, RH - U / 2, -RD),
    tube(U, U, RD * 2, M.powder, -RW, RH - U / 2, 0), tube(U, U, RD * 2, M.powder, RW, RH - U / 2, 0),
  );
  const pull = cyl(0.016, RW * 2 + 0.28, M.steel); pull.rotation.z = Math.PI / 2; pull.position.set(0, RH - 0.02, RD + 0.1);
  rackTop.add(pull, tube(0.05, 0.05, 0.1, M.powder, -RW, RH - 0.03, RD + 0.06), tube(0.05, 0.05, 0.1, M.powder, RW, RH - 0.03, RD + 0.06));
  rack.add(rackTop);
  drop(rackTop, 640, 520, 0.55);
  const rackBase = new THREE.Group();
  rackBase.add(tube(U, 0.05, RD * 2 + 0.25, M.powder, -RW, 0.025, 0), tube(U, 0.05, RD * 2 + 0.25, M.powder, RW, 0.025, 0), tube(RW * 2, 0.05, U, M.powder, 0, 0.025, -RD));
  rack.add(rackBase);
  tl.add(200, 300, p => { show(rackBase, p); rackBase.scale.set(1, 1, Math.max(0.001, ease.outCubic(p))); });

  // J-cups with UHMW liners + spotter arms.
  const hooks = new THREE.Group();
  const barY = 1.38;
  for (const x of [-RW, RW]) {
    hooks.add(tube(0.09, 0.15, 0.03, M.powder, x, barY - 0.02, RD + U / 2 + 0.015, 0.004));
    hooks.add(tube(0.08, 0.025, 0.11, M.powder, x, barY - 0.085, RD + 0.1, 0.004));
    hooks.add(tube(0.08, 0.07, 0.02, M.powder, x, barY - 0.05, RD + 0.155, 0.004));
    hooks.add(box(0.07, 0.006, 0.09, M.uhmw, x, barY - 0.069, RD + 0.1));
    hooks.add(tube(0.06, 0.06, RD * 2 + 0.5, M.powder, x, 0.82, 0.12), box(0.07, 0.02, RD * 2 + 0.5, M.uhmw, x, 0.86, 0.12));
  }
  rack.add(hooks);
  slide(hooks, 860, 360, new THREE.Vector3(0, 0, 0.3), ease.outCubic);

  // Bumper plates: lathe profile with recessed face, moulded lettering band, raised lip and steel hub.
  const plateGeoCache = new Map<string, THREE.BufferGeometry[]>();
  const plateMatCache = new Map<string, THREE.Material>();
  function bumper(R: number, T: number, label: string, tint = '#ffffff') {
    const key = `${R}-${T}`;
    let geos = plateGeoCache.get(key);
    if (!geos) {
      const h = T / 2, band0 = R * 0.66, band1 = R * 0.9;
      const body = [
        [0.071, -h + 0.004], [0.13 * R / 0.225, -h + 0.004], [band0, -h + 0.006], [band1, -h + 0.006], [R - 0.012, -h + 0.002], [R - 0.004, -h], [R, -h + 0.008],
        [R, h - 0.008], [R - 0.004, h], [R - 0.012, h - 0.002], [band1, h - 0.006], [band0, h - 0.006], [0.13 * R / 0.225, h - 0.004], [0.071, h - 0.004],
      ].map(([x, y]) => new THREE.Vector2(x, y));
      const insert = [[0.0258, -h + 0.001], [0.072, -h + 0.001], [0.072, h - 0.001], [0.0258, h - 0.001], [0.0258, -h + 0.001]].map(([x, y]) => new THREE.Vector2(x, y));
      geos = [geo(new THREE.LatheGeometry(body, 96)), geo(new THREE.LatheGeometry(insert, 40))];
      plateGeoCache.set(key, geos);
    }
    let mat = plateMatCache.get(label + tint);
    if (!mat) {
      mat = track(new THREE.MeshStandardMaterial({ map: track(plateTexture(label)), color: tint, roughness: 0.8, metalness: 0 }));
      plateMatCache.set(label + tint, mat);
    }
    const g = new THREE.Group();
    g.add(mesh(geos[0], mat), mesh(geos[1], M.steel));
    return g;
  }
  for (const side of [-1, 1]) {
    const horn = cyl(0.025, 0.24, M.powder); horn.rotation.z = Math.PI / 2;
    horn.position.set(side * (RW + 0.12), 0.48, -RD);
    rack.add(horn);
    grow(horn, 600, 300);
    [[0.07, '25 KG'], [0.066, '20 KG'], [0.05, '10 KG']].forEach(([T, label], k) => {
      const t = T as number;
      const pl = bumper(0.225, t, label as string);
      pl.rotation.z = side * Math.PI / 2;
      pl.position.set(side * (RW + 0.07 + k * 0.075 + t / 2), 0.48, -RD);
      rack.add(pl);
      slide(pl, 1900 + k * 110 + (side > 0 ? 60 : 0), 520, new THREE.Vector3(side * 0.7, 0, 0), ease.outCubic);
    });
  }

  /* ---------- 3. Loaded barbell: bar drops into the J-cups, plates slide on one by one ---------- */
  const bar = new THREE.Group();
  bar.position.set(0, barY - 0.052, RD + 0.1);
  rack.add(bar);
  const shaft = cyl(0.014, 1.31, M.satin, 24); shaft.rotation.z = Math.PI / 2;
  bar.add(shaft);
  for (const side of [-1, 1]) {
    const collar = cyl(0.036, 0.03, M.chrome); collar.rotation.z = Math.PI / 2; collar.position.x = side * 0.67;
    const sleeve = cyl(0.025, 0.415, M.chrome); sleeve.rotation.z = Math.PI / 2; sleeve.position.x = side * (0.685 + 0.2075);
    const cap = cyl(0.027, 0.012, M.steel); cap.rotation.z = Math.PI / 2; cap.position.x = side * 1.1;
    const mark = cyl(0.0146, 0.004, M.steel, 16); mark.rotation.z = Math.PI / 2; mark.position.x = side * 0.455;
    bar.add(collar, sleeve, cap, mark);
  }
  drop(bar, 980, 520, 0.85);
  const barPlates: { R: number; T: number; label: string; tint?: string }[] = [
    { R: 0.225, T: 0.066, label: '20 KG' }, { R: 0.225, T: 0.066, label: '20 KG' }, { R: 0.225, T: 0.053, label: '15 KG' }, { R: 0.16, T: 0.03, label: '5 KG', tint: '#c9c9c4' },
  ];
  let order = 0;
  for (let k = 0; k < barPlates.length; k++) {
    let x = 0.7;
    for (let j = 0; j < k; j++) x += barPlates[j].T + 0.002;
    for (const side of [-1, 1]) {
      const { R, T, label, tint } = barPlates[k];
      const holder = new THREE.Group();
      const pl = bumper(R, T, label, tint);
      pl.rotation.z = side * Math.PI / 2;
      holder.add(pl);
      holder.position.set(side * (x + T / 2), 0, 0);
      bar.add(holder);
      const spin = 0.6 + k * 0.4;
      slide(holder, 1380 + order * 85, 420, new THREE.Vector3(side * 0.5, 0, 0), ease.outCubic);
      tl.add(1380 + order * 85, 420, p => { holder.rotation.x = side * spin * (1 - ease.outCubic(p)); });
      order++;
    }
  }
  let clampX = 0.7;
  barPlates.forEach(p => { clampX += p.T + 0.002; });
  for (const side of [-1, 1]) {
    const cl = cyl(0.045, 0.035, M.iron); cl.rotation.z = Math.PI / 2; cl.position.x = side * (clampX + 0.02);
    const lever = tube(0.01, 0.045, 0.01, M.iron, side * (clampX + 0.02), 0.06, 0, 0.003);
    const g = new THREE.Group(); g.add(cl, lever);
    bar.add(g);
    slide(g, 2120 + (side > 0 ? 70 : 0), 300, new THREE.Vector3(side * 0.3, 0, 0), ease.outCubic);
  }

  /* ---------- 4. Architecture: back wall with a real window opening, slats, frame, exterior ---------- */
  const architecture = new THREE.Group();
  world.add(architecture);
  const wallZ = -4.4;
  const WX0 = -0.9, WX1 = 7.3, WY0 = 0.55, WY1 = 3.55;
  const backWall = new THREE.Group();
  backWall.add(
    box(14.1, 6, 0.2, M.wall, -7.95, 3, wallZ - 0.1), box(7.7, 6, 0.2, M.wall, 11.15, 3, wallZ - 0.1),
    box(WX1 - WX0, WY0, 0.2, M.wall, (WX0 + WX1) / 2, WY0 / 2, wallZ - 0.1), box(WX1 - WX0, 6 - WY1, 0.2, M.wall, (WX0 + WX1) / 2, (6 + WY1) / 2, wallZ - 0.1),
  );
  architecture.add(backWall);
  tl.add(620, 760, p => { show(backWall, p); backWall.scale.y = Math.max(0.001, ease.outQuart(p)); });

  // Timber slat feature wall – 45 mm slats at 90 mm centres on a dark battened backing.
  const slatGeo = geo(new THREE.BoxGeometry(0.045, 4.2, 0.04));
  const SLATS = 86;
  const slats = new THREE.InstancedMesh(slatGeo, M.slat, SLATS);
  slats.castShadow = true; slats.receiveShadow = true;
  architecture.add(slats);
  const slatStart = -8.6;
  tl.add(820, 950, p => {
    const ms = p * 950;
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

  // Glazing: steel mullions and transoms (they cast the window shadows), thin glass, the street beyond.
  const mullions = new THREE.Group();
  for (let i = 0; i <= 7; i++) mullions.add(tube(0.07, WY1 - WY0 + 0.1, 0.12, M.frame, WX0 + i * ((WX1 - WX0) / 7), (WY0 + WY1) / 2, wallZ - 0.02, 0.008));
  mullions.add(tube(WX1 - WX0 + 0.1, 0.09, 0.14, M.frame, (WX0 + WX1) / 2, WY0, wallZ - 0.02), tube(WX1 - WX0 + 0.1, 0.09, 0.14, M.frame, (WX0 + WX1) / 2, WY1, wallZ - 0.02), tube(WX1 - WX0, 0.05, 0.1, M.frame, (WX0 + WX1) / 2, 2.62, wallZ - 0.02));
  architecture.add(mullions);
  drop(mullions, 1000, 620, 0.9, ease.outQuart);
  const glass = mesh(geo(new THREE.PlaneGeometry(WX1 - WX0, WY1 - WY0)), M.glass, false, false);
  glass.position.set((WX0 + WX1) / 2, (WY0 + WY1) / 2, wallZ - 0.05);
  architecture.add(glass);
  const outsideGround = mesh(geo(new THREE.PlaneGeometry(40, 16)), M.outside, false, true);
  outsideGround.rotation.x = -Math.PI / 2; outsideGround.position.set(3, -0.01, wallZ - 8.2);
  const backdrop = mesh(geo(new THREE.PlaneGeometry(46, 14.4)), M.sky, false, false);
  backdrop.position.set(3, 5.0, wallZ - 16);
  architecture.add(outsideGround, backdrop);
  let outside = 0;
  tl.add(1100, 800, p => { outside = ease.inOutSine(p); show(glass, p); show(backdrop, p); show(outsideGround, p); });

  // Ceiling slab and exposed steel beams close over the room from the back.
  const roof = new THREE.Group();
  const ceiling = box(30, 0.12, 14, M.ceiling, 0, 4.31, 1.5); ceiling.receiveShadow = true;
  roof.add(ceiling);
  for (let i = 0; i < 5; i++) roof.add(tube(30, 0.32, 0.16, M.powder, 0, 4.09, wallZ + 1.2 + i * 2.2, 0.01));
  architecture.add(roof);
  slide(roof, 1500, 760, new THREE.Vector3(0, 0, -14), ease.outQuart);

  // Floor + ceiling LED coves along the wall (lit later).
  const coveLow = box(15, 0.025, 0.05, M.cove, -7.5 + WX0, 0.04, wallZ + 0.06); coveLow.castShadow = false;
  const coveHigh = box(30, 0.03, 0.06, M.cove, 0, 4.2, wallZ + 0.06); coveHigh.castShadow = false;
  architecture.add(coveLow, coveHigh);
  tl.add(820, 1, p => { show(coveLow, p); show(coveHigh, p); });

  /* ---------- 5. Flat bench ---------- */
  const bench = new THREE.Group();
  bench.position.set(1.95, 0.03, 0.55);
  bench.rotation.y = -0.42;
  world.add(bench);
  const rail = tube(0.08, 0.06, 1.06, M.powder, 0, 0.2, 0);
  const frontLeg = new THREE.Group();
  frontLeg.add(tube(0.06, 0.32, 0.06, M.powder, 0, 0.2, 0.48), tube(0.5, 0.05, 0.07, M.powder, 0, 0.03, 0.5));
  for (const sx of [-0.23, 0.23]) frontLeg.add(box(0.05, 0.012, 0.06, M.rubber, sx, 0.006, 0.5));
  const rearLeg = new THREE.Group();
  rearLeg.add(tube(0.06, 0.32, 0.06, M.powder, 0, 0.2, -0.46), tube(0.42, 0.05, 0.07, M.powder, 0, 0.03, -0.5));
  for (const sx of [-0.2, 0.2]) { const w = cyl(0.035, 0.03, M.rubber, 20); w.rotation.z = Math.PI / 2; w.position.set(sx, 0.035, -0.56); rearLeg.add(w); }
  const handle = cyl(0.014, 0.42, M.steel); handle.rotation.x = Math.PI / 2; handle.position.set(0, 0.22, 0.72);
  const pad = mesh(geo(new RoundedBoxGeometry(0.3, 0.075, 1.18, 4, 0.03)), M.leather); pad.position.set(0, 0.4, 0);
  const board = box(0.27, 0.025, 1.12, M.powderEdge, 0, 0.352, 0);
  // Upholstery piping around the top edge of the pad.
  const pipeShape = new THREE.Shape();
  { const w = 0.142, d = 0.582, r = 0.026; pipeShape.moveTo(-w + r, -d); pipeShape.lineTo(w - r, -d); pipeShape.quadraticCurveTo(w, -d, w, -d + r); pipeShape.lineTo(w, d - r); pipeShape.quadraticCurveTo(w, d, w - r, d); pipeShape.lineTo(-w + r, d); pipeShape.quadraticCurveTo(-w, d, -w, d - r); pipeShape.lineTo(-w, -d + r); pipeShape.quadraticCurveTo(-w, -d, -w + r, -d); }
  const pipePts = pipeShape.getSpacedPoints(120).map(p => new THREE.Vector3(p.x, 0.428, p.y));
  const piping = mesh(geo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pipePts, true), 240, 0.0035, 6, true)), M.piping, false, false);
  const post = tube(0.06, 0.12, 0.06, M.powder, 0, 0.29, 0);
  bench.add(rail, frontLeg, rearLeg, handle, board, pad, piping, post);
  slide(bench, 1750, 700, new THREE.Vector3(1.6, 0, 1.1), ease.outQuart);
  tl.add(1750, 700, p => { bench.rotation.y = -0.42 - 0.35 * (1 - ease.outQuart(p)); });

  function dumbbell(r: number, len: number) {
    const g = new THREE.Group();
    const hexGeo = geo(new THREE.CylinderGeometry(r, r, len, 6));
    const h = cyl(0.017, 0.14, M.chrome, 16); h.rotation.x = Math.PI / 2;
    g.add(h);
    for (const s of [-1, 1]) {
      const head = mesh(hexGeo, M.rubber); head.rotation.x = Math.PI / 2; head.position.z = s * (0.07 + len / 2);
      const cap = cyl(r * 0.45, 0.004, M.steel, 20); cap.rotation.x = Math.PI / 2; cap.position.z = s * (0.07 + len + 0.002);
      g.add(head, cap);
    }
    return g;
  }
  const benchBells = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const d = dumbbell(0.068, 0.07); d.rotation.y = Math.PI / 2 - 0.35 + i * 0.12; d.position.set(2.3 + i * 0.12, 0.03 + 0.068 * Math.cos(Math.PI / 6), 1.25 + i * 0.26);
    benchBells.add(d);
    drop(d, 2350 + i * 110, 480, 0.6);
  }
  world.add(benchBells);

  /* ---------- 6. Two-tier hex dumbbell rack + kettlebells ---------- */
  const dbRack = new THREE.Group();
  dbRack.position.set(-3.05, 0.03, -3.6);
  world.add(dbRack);
  const dbFrame = new THREE.Group();
  const DL = 2.3;
  for (const x of [-DL / 2, 0, DL / 2]) {
    dbFrame.add(tube(0.06, 0.82, 0.06, M.powder, x, 0.41, -0.14), tube(0.06, 0.5, 0.06, M.powder, x, 0.25, 0.22), tube(0.07, 0.04, 0.62, M.powder, x, 0.02, 0.04));
  }
  const shelfHi = tube(DL + 0.08, 0.035, 0.26, M.powder, 0, 0.78, -0.08); shelfHi.rotation.x = 0.32;
  const shelfLo = tube(DL + 0.08, 0.035, 0.3, M.powder, 0, 0.46, 0.2); shelfLo.rotation.x = 0.32;
  dbFrame.add(shelfHi, shelfLo);
  dbRack.add(dbFrame);
  tl.add(1850, 420, p => { show(dbFrame, p); dbFrame.scale.y = Math.max(0.001, ease.outQuart(p)); });
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
      drop(d, 2020 + bellIndex * 42, 440, 0.45);
      bellIndex++;
    });
  });
  const kbGeo = geo(new THREE.SphereGeometry(1, 28, 20));
  const kbHandle = geo(new THREE.TorusGeometry(0.62, 0.11, 10, 28, Math.PI * 1.15));
  [0.105, 0.115, 0.125, 0.135].forEach((r, i) => {
    const kb = new THREE.Group();
    const body = mesh(kbGeo, M.iron); body.scale.set(r, r * 0.95, r); body.position.y = r * 0.92;
    const base = cyl(r * 0.62, 0.012, M.iron, 24); base.position.y = 0.006;
    const hd = mesh(kbHandle, M.iron); hd.scale.setScalar(r); hd.position.y = r * 1.62; hd.rotation.z = -Math.PI * 0.075;
    kb.add(body, base, hd);
    kb.position.set(-3.9 + i * 0.34, 0.03, -2.85);
    kb.rotation.y = 0.2 + i * 0.15;
    world.add(kb);
    drop(kb, 2300 + i * 90, 420, 0.5);
  });

  /* ---------- 7. Dual-stack functional trainer: towers, pulleys, cables, selectorised stacks ---------- */
  const trainer = new THREE.Group();
  trainer.position.set(-4.7, 0.03, -2.4);
  trainer.rotation.y = 0.35;
  world.add(trainer);
  const TW = 1.7;
  const pulleyGeo = geo(new THREE.CylinderGeometry(0.045, 0.045, 0.022, 28));
  for (const s of [-1, 1]) {
    const tower = new THREE.Group();
    tower.position.x = s * TW / 2;
    tower.add(tube(0.1, 2.25, 0.1, M.powder, 0, 1.125, 0.18), tube(0.1, 2.25, 0.1, M.powder, 0, 1.125, -0.22), tube(0.42, 0.06, 0.62, M.powder, 0, 0.03, 0), tube(0.1, 0.08, 0.5, M.powder, 0, 2.2, 0));
    for (const gx of [-0.06, 0.06]) { const rod = cyl(0.009, 2.0, M.chrome, 12); rod.position.set(gx, 1.08, -0.02); tower.add(rod); }
    tower.add(tube(0.34, 1.05, 0.02, M.powderEdge, 0, 1.45, 0.13, 0.004));
    const topPulley = mesh(pulleyGeo, M.steel); topPulley.rotation.z = Math.PI / 2; topPulley.position.set(0, 2.12, 0.1);
    const stackCable = cyl(0.003, 1.6, M.cable, 6); stackCable.position.set(0, 1.3, 0.06);
    tower.add(topPulley, stackCable);
    trainer.add(tower);
    grow(tower, 2200 + (s > 0 ? 90 : 0), 500);
    const stack = new THREE.Group();
    stack.position.x = s * TW / 2;
    for (let k = 0; k < 14; k++) {
      const plate = tube(0.24, 0.032, 0.16, k === 13 ? M.steel : M.iron, 0, 0.08 + k * 0.034, -0.02, 0.004);
      stack.add(plate);
      drop(plate, 2420 + k * 30 + (s > 0 ? 40 : 0), 280, 0.35);
    }
    const pin = cyl(0.006, 0.09, M.brass, 10); pin.rotation.x = Math.PI / 2; pin.position.set(0.0, 0.08 + 6 * 0.034, 0.08);
    stack.add(pin);
    trainer.add(stack);
    const carriage = new THREE.Group();
    carriage.position.set(s * (TW / 2 - 0.02), 1.3, 0.3);
    const pulley = mesh(pulleyGeo, M.steel); pulley.rotation.z = Math.PI / 2;
    const cable = cyl(0.003, 0.5, M.cable, 6); cable.position.set(0, -0.28, 0.02);
    const handleD = mesh(geo(new THREE.TorusGeometry(0.06, 0.009, 10, 24, Math.PI)), M.cable); handleD.position.set(0, -0.55, 0.02); handleD.rotation.z = Math.PI;
    const grip = cyl(0.014, 0.11, M.rubber, 14); grip.rotation.z = Math.PI / 2; grip.position.set(0, -0.6, 0.02);
    carriage.add(pulley, cable, handleD, grip, tube(0.12, 0.2, 0.06, M.powder, 0, 0.1, -0.02));
    trainer.add(carriage);
    drop(carriage, 2750 + (s > 0 ? 60 : 0), 400, 0.45);
  }
  const topG = new THREE.Group();
  const chin = cyl(0.016, TW, M.steel); chin.rotation.z = Math.PI / 2; chin.position.set(0, 2.08, 0.32);
  topG.add(tube(TW + 0.1, 0.1, 0.1, M.powder, 0, 2.2, -0.02), chin);
  trainer.add(topG);
  drop(topG, 2620, 400, 0.4);

  /* ---------- 8. Cardio row beneath the windows ---------- */
  function treadmill() {
    const g = new THREE.Group();
    const deck = mesh(geo(new RoundedBoxGeometry(0.82, 0.2, 1.95, 3, 0.04)), M.powderEdge); deck.position.y = 0.16;
    const belt = box(0.56, 0.02, 1.6, M.belt, 0, 0.27, 0.05);
    const railL = tube(0.12, 0.03, 1.7, M.alu, -0.34, 0.27, 0.05), railR = tube(0.12, 0.03, 1.7, M.alu, 0.34, 0.27, 0.05);
    const motor = mesh(geo(new RoundedBoxGeometry(0.82, 0.3, 0.32, 3, 0.05)), M.powderEdge); motor.position.set(0, 0.22, -0.98);
    const uprL = tube(0.06, 1.1, 0.08, M.powder, -0.36, 0.78, -0.92); uprL.rotation.x = -0.18;
    const uprR = tube(0.06, 1.1, 0.08, M.powder, 0.36, 0.78, -0.92); uprR.rotation.x = -0.18;
    const armL = cyl(0.018, 0.5, M.alu, 14), armR = cyl(0.018, 0.5, M.alu, 14);
    armL.rotation.x = armR.rotation.x = Math.PI / 2; armL.position.set(-0.36, 1.12, -0.72); armR.position.set(0.36, 1.12, -0.72);
    const consoleBody = mesh(geo(new RoundedBoxGeometry(0.8, 0.36, 0.1, 3, 0.03)), M.powderEdge); consoleBody.position.set(0, 1.42, -1.03); consoleBody.rotation.x = 0.35;
    const screen = box(0.5, 0.26, 0.012, M.screen, 0, 1.43, -0.975); screen.rotation.x = 0.35; screen.castShadow = false;
    g.add(deck, belt, railL, railR, motor, uprL, uprR, armL, armR, consoleBody, screen);
    for (const fx of [-0.36, 0.36]) for (const fz of [-0.9, 0.9]) g.add(box(0.07, 0.03, 0.07, M.rubber, fx, 0.015, fz));
    return g;
  }
  for (let i = 0; i < 3; i++) {
    const t = treadmill();
    t.position.set(1.95 + i * 1.1, 0.03, -2.75);
    world.add(t);
    slide(t, 2450 + i * 130, 650, new THREE.Vector3(0, 0, -2.2), ease.outQuart);
  }

  /* ---------- 9. Linear pendant lighting ---------- */
  const fixtures: { bar: THREE.Group; light: THREE.RectAreaLight }[] = [];
  [-3.1, -1.15, 0.8].forEach((z, i) => {
    const x = 0.4;
    const g = new THREE.Group();
    g.position.set(x, 3.55, z);
    const housing = tube(5.2, 0.06, 0.08, M.lightBar, 0, 0, 0, 0.01); housing.castShadow = false;
    const diffuser = box(5.15, 0.012, 0.06, M.diffuser, 0, -0.034, 0); diffuser.castShadow = false;
    const w1 = cyl(0.002, 0.7, M.cable, 4), w2 = cyl(0.002, 0.7, M.cable, 4);
    w1.position.set(-2.2, 0.38, 0); w2.position.set(2.2, 0.38, 0);
    g.add(housing, diffuser, w1, w2);
    world.add(g);
    drop(g, 2800 + i * 90, 500, -0.8, ease.outQuart);
    const ra = new THREE.RectAreaLight('#fff', 0, 5.1, 0.12);
    ra.position.set(x, 3.5, z);
    ra.lookAt(x, 0, z);
    scene.add(ra);
    fixtures.push({ bar: g, light: ra });
  });

  /* ---------- 10. Aureon chevron (source glyph path M2.5 20.2 12 1.8l9.5 18.4) ---------- */
  const s = 0.05;
  const chevronOrigin = new THREE.Vector3(-3.05, 1.6, wallZ + 0.12);
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
  tl.add(3700, 650, p => {
    chevron.visible = p > 0;
    chevGeo.setDrawRange(0, Math.floor((chevIndexCount / 6) * ease.inOutCubic(p)) * 6);
  });

  /* ---------- Lighting plan ----------
   * work/key: warm spot over the platform, on from the first frame (so the empty stage is legible)
   * rim: cool spot from the window side, separates black steel from a dark room
   * window: area light in the glazing (dusk blue or overcast daylight)   sun: light theme only, casts mullion shadows
   * practicals: three linear pendants + cove wash, switched on once the room is built */
  const hemi = new THREE.HemisphereLight('#fff', '#000', 0.2);
  scene.add(hemi);
  const key = new THREE.SpotLight('#fff', 0, 18, 0.5, 0.85, 1.3);
  key.position.set(1.3, 5.6, 2.6);
  key.target.position.set(0.1, 0.4, -1.3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.015;
  key.shadow.radius = 5;
  key.shadow.camera.near = 2; key.shadow.camera.far = 14;
  scene.add(key, key.target);
  const rim = new THREE.SpotLight('#fff', 0, 14, 0.5, 0.9, 1.4);
  rim.position.set(-2.4, 3.7, -3.9);
  rim.target.position.set(0.6, 1.0, -0.4);
  scene.add(rim, rim.target);
  const sun = new THREE.DirectionalLight('#fff1da', 0);
  sun.position.set(10, 6.6, -14);
  sun.target.position.set(1.6, 0, 1.2);
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 9, bottom: -9, near: 4, far: 40 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const windowLight = new THREE.RectAreaLight('#fff', 0, WX1 - WX0, WY1 - WY0);
  windowLight.position.set((WX0 + WX1) / 2, (WY0 + WY1) / 2, wallZ - 0.06);
  windowLight.lookAt((WX0 + WX1) / 2, (WY0 + WY1) / 2, 4);
  scene.add(windowLight);
  const wallWash = new THREE.RectAreaLight('#ffb766', 0, 15, 0.25);
  wallWash.position.set(-7.5 + WX0, 0.25, wallZ + 0.35);
  wallWash.lookAt(-7.5 + WX0, 1.6, wallZ - 2);
  scene.add(wallWash);

  let work = 0, lightsOn = 0, brandOn = 0, screensOn = 0;
  tl.add(0, 380, p => { work = ease.outCubic(p); });
  tl.add(3000, 850, p => { lightsOn = ease.inOutSine(p); });
  tl.add(3450, 700, p => { screensOn = p; });
  tl.add(3900, 650, p => { brandOn = ease.inOutSine(p); });

  /* ---------- Post: AO for contact, gentle bloom on practicals, film grade ---------- */
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const gtao = new GTAOPass(scene, camera, 1, 1);
  gtao.updateGtaoMaterial({ radius: 0.32, distanceExponent: 1.4, thickness: 1.2, scale: 1.15, samples: 16, distanceFallOff: 1 });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
  gtao.blendIntensity = 0.9;
  gtao.enabled = !lowPower;
  // Glass and the distant backdrop must not collect AO (GTAO only skips points/lines by itself).
  const gtaoInternal = gtao as unknown as { _overrideVisibility(): void; _visibilityCache: THREE.Object3D[] };
  const baseOverride = gtaoInternal._overrideVisibility.bind(gtao);
  gtaoInternal._overrideVisibility = () => {
    baseOverride();
    for (const o of [glass, backdrop]) if (o.visible) { o.visible = false; gtaoInternal._visibilityCache.push(o); }
  };
  composer.addPass(gtao);
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.35, 0.55, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader);
  composer.addPass(grade);
  disposables.push(composer, target, gtao, bloom);

  function applyLook() {
    const L = LOOKS[theme];
    scene.background = new THREE.Color(L.background);
    const fog = scene.fog as THREE.Fog;
    fog.color.set(L.background); fog.near = L.fog[0]; fog.far = L.fog[1];
    const fm = floorMap(theme);
    if (M.floor.map !== fm) { M.floor.map = fm; M.floor.needsUpdate = true; }
    M.floor.color.set(L.floor); M.floorBase.color.set(L.floorBase);
    M.wall.color.set(L.wall); M.slat.color.set(L.slat); M.ceiling.color.set(L.ceiling); M.outside.color.set(L.outside);
    const ext = exteriorMap(theme);
    if (M.sky.map !== ext) { M.sky.map = ext; M.sky.needsUpdate = true; }
    M.sky.opacity = outside;
    M.glass.opacity = 0.12 * outside;
    scene.environmentIntensity = L.env;
    renderer.toneMappingExposure = L.exposure;
    hemi.color.set(L.hemiSky); hemi.groundColor.set(L.hemiGround);
    hemi.intensity = lerp(L.hemi[0], L.hemi[1], Math.max(lightsOn, outside * 0.5));
    key.color.set(L.keyColor);
    key.intensity = work * lerp(L.key[0], L.key[1], outside * 0.3) + lightsOn * (L.key[2] - L.key[1]);
    rim.color.set(L.rimColor); rim.intensity = L.rim * work;
    const sunOn = L.sun > 0;
    if (sun.castShadow !== sunOn) sun.castShadow = sunOn;
    sun.intensity = L.sun * Math.max(work * 0.35, outside);
    windowLight.color.set(L.windowColor); windowLight.intensity = L.window * outside;
    fixtures.forEach(({ light }, i) => {
      light.color.set(L.barColor);
      light.intensity = L.bar * clamp01(lightsOn * 1.6 - i * 0.18);
    });
    M.diffuser.emissiveIntensity = lerp(theme === 'dark' ? 0.04 : 0.3, L.barEmissive, lightsOn);
    M.cove.emissiveIntensity = 3.2 * lightsOn;
    wallWash.intensity = L.cove * lightsOn;
    M.chevron.emissiveIntensity = 2.4 * brandOn;
    brandLight.intensity = L.brand * brandOn;
    M.screen.emissiveIntensity = 1.6 * screensOn;
    bloom.strength = L.bloom;
    grade.uniforms.vignette.value = theme === 'dark' ? 0.26 : 0.14;
    grade.uniforms.grain.value = theme === 'dark' ? 0.018 : 0.008;
  }

  /* ---------- Camera: a slow pull-back reveal on a shift lens (verticals stay vertical) ---------- */
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), qa = new THREE.Vector3(), qb = new THREE.Vector3();
  let camProgress = 0;
  tl.add(0, ASSEMBLY_MS, p => { camProgress = p; });
  function applyCamera() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    if (options.shot) {
      const S = SHOTS[options.shot];
      camera.fov = S.fov; camera.aspect = w / h;
      camera.position.copy(S.pos); camera.lookAt(S.look);
      camera.clearViewOffset(); camera.updateProjectionMatrix();
      return;
    }
    const C = CAMERAS[layout];
    const e = ease.inOutSine(camProgress) * 0.45 + ease.outCubic(camProgress) * 0.55;
    qa.lerpVectors(C.from, C.via, e); qb.lerpVectors(C.via, C.to, e);
    camPos.lerpVectors(qa, qb, e);
    camLook.lerpVectors(C.lookFrom, C.look, ease.inOutSine(camProgress));
    camera.fov = C.fov;
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    camera.aspect = w / h;
    camera.setViewOffset(w, h, C.shift[0] * w, C.shift[1] * h, w, h);
    camera.updateProjectionMatrix();
  }

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    layout = w / h < 0.9 || w < 720 ? 'mobile' : 'desktop';
    const dpr = Math.min(window.devicePixelRatio || 1, layout === 'mobile' ? 1.5 : 1.6);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    grade.uniforms.res.value.set(w * dpr, h * dpr);
  }

  let clock = 0, last = -1, raf = 0, settled = false, firstFrame = false, disposed = false, started = false;
  function frame(now: number) {
    if (disposed) return;
    // Accumulated, clamped delta: a hidden tab (no rAF) resumes where it paused instead of jumping ahead.
    if (last >= 0) clock += Math.min(now - last, 250);
    last = now;
    const t = options.freezeAt ?? (options.instant ? tl.end : clock);
    renderAt(t);
    if (!firstFrame) { firstFrame = true; options.onFirstFrame?.(); }
    if (options.freezeAt !== undefined) { raf = 0; return; }
    if (t >= tl.end) {
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
    composer.render();
  }
  function requestRender() {
    if (raf || disposed || !started) return;
    if (settled || options.freezeAt !== undefined) renderAt(options.freezeAt ?? tl.end);
  }

  resize();
  tl.seek(0);
  applyLook();
  texReady.then(() => {
    if (disposed) return;
    started = true;
    raf = requestAnimationFrame(frame);
  });

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
