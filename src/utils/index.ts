/**
 * Utility functions for Tycho Solver
 */

/**
 * Generates a random number between min and max
 */
import { RNG } from './rng';

export function random(min: number, max: number, rng?: RNG): number {
  const r = rng ? rng.random() : Math.random();
  return min + r * (max - min);
}

/**
 * Generates a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number, rng?: RNG): number {
  return Math.floor(random(min, max + 1, rng));
}

export { RNG, seededRandom } from './rng';

export * from './logger';
