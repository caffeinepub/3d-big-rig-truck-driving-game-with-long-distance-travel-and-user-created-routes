/**
 * Deterministic random number generator using a simple LCG algorithm.
 * Produces stable, repeatable sequences for visual variation.
 */
export class DeterministicRandom {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  /**
   * Returns a pseudo-random number between 0 and 1
   */
  next(): number {
    // Linear Congruential Generator (LCG)
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  /**
   * Returns a pseudo-random number between min and max
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Returns a pseudo-random integer between min (inclusive) and max (exclusive)
   */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }
}
