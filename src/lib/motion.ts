/** Shared motion vocabulary. CSS mirrors these curves as custom properties in globals.css. */
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const ease = {
  linear: (t: number) => t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  /** Heavy object settling: one small, quickly damped rebound. */
  settle: (t: number) => (t >= 1 ? 1 : 1 - Math.exp(-6.5 * t) * Math.cos(7.2 * t)),
  outBack: (t: number, s = 1.15) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
} as const;

export type Tween = { start: number; duration: number; apply: (progress: number) => void };

/** Deterministic, time-based timeline: identical output for a given clock value. */
export class Timeline {
  private tweens: Tween[] = [];
  end = 0;
  add(start: number, duration: number, apply: (progress: number) => void) {
    this.tweens.push({ start, duration, apply });
    this.end = Math.max(this.end, start + duration);
    return this;
  }
  seek(ms: number) {
    for (const t of this.tweens) t.apply(clamp01((ms - t.start) / t.duration));
  }
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
