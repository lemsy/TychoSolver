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
import { InitializationOperator, EvaluationOperator, SelectionOperator, CrossoverOperator, MutationOperator, ReplacementOperator, ElitismOperator, TerminationOperator } from './operators';
import { RNG } from '../utils/rng';

export interface EvolutionaryConfig<T = any> {
  populationSize: number;
  maxGenerations: number;
  selectionPressure?: number;
  mutationRate?: number;
  crossoverRate?: number;
  elitism?: number;

  // Genetic-algorithm-specific optional fields (kept optional so other algos remain compatible)
  seed?: number;
  rng?: RNG;
  // For population-based algorithms the initialization operator should produce a population array
  initializationOperator?: InitializationOperator<T, T[]>;
  evaluationOperator?: EvaluationOperator<T>;
  selectionOperator?: SelectionOperator<T>;
  crossoverOperator?: CrossoverOperator<T>;
  mutationOperator?: MutationOperator<T>;
  replacementOperator?: ReplacementOperator<T>;
  elitismOperator?: ElitismOperator<T>;
  terminationOperator?: TerminationOperator<T>;
  individualFactory?: () => T;
  eliteCount?: number;
  fitnessLimit?: number;
}

/**
 * Interface for evolutionary algorithm implementations
 */
export interface EvolutionaryAlgorithm<T> {
  evolve(generations?: number): Promise<T>;
  getBestSolution(): T;
  getBestFitness(): number;
  getPopulation(): T[];
  getGeneration(): number;
}
