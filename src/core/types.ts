/**
 * Core types for the Tycho Solver library
 */

/**
 * Represents a fitness function that evaluates the quality of a solution
 */
export type FitnessFunction<T> = (individual: T) => number;

/**
 * Configuration options for evolutionary algorithms
 */
export interface EvolutionaryConfig {
  populationSize: number;
  maxGenerations: number;
  selectionPressure?: number;
  mutationRate?: number;
  crossoverRate?: number;
  elitism?: number;
}

/**
 * Interface for evolutionary algorithm implementations
 */
export interface EvolutionaryAlgorithm<T> {
  evolve(generations?: number): T;
  getBestSolution(): T;
  getBestFitness(): number;
  getPopulation(): T[];
  getGeneration(): number;
}
