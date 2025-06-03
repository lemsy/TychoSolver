/**
 * GeneticAlgorithm.ts
 * A flexible and powerful genetic algorithm library for TypeScript and JavaScript
 */

/**
 * Interface representing an individual in a population
 */
export interface Individual<T> {
  genes: T[];
  fitness: number;
}

/**
 * Type definition for the fitness function
 */
export type FitnessFunction<T> = (genes: T[]) => number;

/**
 * Type definition for the gene generator function
 */
export type GeneGenerator<T> = () => T;

/**
 * Type definition for the selection method
 */
export type SelectionMethod<T> = (population: Individual<T>[], fitnessSum: number) => Individual<T>;

/**
 * Type definition for the crossover method
 */
export type CrossoverMethod<T> = (parent1: Individual<T>, parent2: Individual<T>) => [Individual<T>, Individual<T>];

/**
 * Type definition for the mutation method
 */
export type MutationMethod<T> = (individual: Individual<T>, geneGenerator: GeneGenerator<T>) => void;

/**
 * Configuration options for the genetic algorithm
 */
export interface GeneticAlgorithmOptions<T> {
  populationSize: number;
  geneLength: number;
  fitnessFunction: FitnessFunction<T>;
  geneGenerator: GeneGenerator<T>;
  selectionMethod?: SelectionMethod<T>;
  crossoverMethod?: CrossoverMethod<T>;
  mutationMethod?: MutationMethod<T>;
  crossoverRate?: number;
  mutationRate?: number;
  elitismCount?: number;
  maxGenerations?: number;
  targetFitness?: number;
}

/**
 * Export utility functions
 */
export const geneticAlgorithmUtils = {
  /**
   * Helper to create a binary gene generator
   */
  binaryGeneGenerator: (): 0 | 1 => Math.random() < 0.5 ? 0 : 1,

  /**
   * Helper to convert binary genes to decimal
   */
  binaryToDecimal: (genes: number[] | (0 | 1)[]): number => {
    return genes.reduce((decimal, bit, index) => {
      if (bit !== 0 && bit !== 1) {
        throw new Error(`Invalid binary value at index ${index}: ${bit}. Only 0 and 1 are allowed.`);
      }
      return decimal + bit * Math.pow(2, genes.length - index - 1);
    }, 0);
  },

  /**
   * Helper to create a gene generator for real values in a range
   */
  realValueGeneGenerator: (min: number, max: number): GeneGenerator<number> => {
    return () => min + Math.random() * (max - min);
  }
};

/**
 * Tycho Solver - Evolutionary Computation Library
 * 
 * A modular and extensible library for evolutionary computation
 * and optimization problems.
 */

// Core interfaces
export * from './core/types';

// Algorithm implementations
export * from './algorithms';

// Utility functions
export * from './utils';

// Local search algorithm and types
export * from './search/localSearch';
