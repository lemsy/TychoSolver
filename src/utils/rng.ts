// Simple seeded RNG (LCG) for reproducible runs
export class RNG {
  private state: number;
  constructor(seed?: number) {
    if (seed === undefined || seed === null) {
      // derive seed from current time
      seed = Date.now() & 0xffffffff;
    }
    this.state = seed >>> 0;
  }

  // returns float in [0,1)
  random(): number {
    // constants from Numerical Recipes
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return (this.state & 0xffffffff) / 0x100000000;
  }

  // returns integer in [0, n)
  int(n: number): number {
    return Math.floor(this.random() * n);
  }
}

export function seededRandom(seed?: number) {
  return new RNG(seed);
}
