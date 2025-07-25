/**
 * Genetic Algorithm implementation
 */

import { EvolutionaryAlgorithm, EvolutionaryConfig, FitnessFunction } from '../../core/types';
import { GALoopOperator } from './components/GALoopOperator';
import { GAInitializationOperator } from './components/InitializationOperator';
import { GAEvaluationOperator } from './components/EvaluationOperator';

export class GeneticAlgorithm<T> implements EvolutionaryAlgorithm<T> {
  private population: T[];
  private bestSolution: T;
  private bestFitness: number;
  private generation: number;
  private config: EvolutionaryConfig;
  private fitnessFunction: FitnessFunction<T>;

  constructor(
    fitnessFunction: FitnessFunction<T>,
    config: EvolutionaryConfig
  ) {
    this.fitnessFunction = fitnessFunction;
    this.config = config;
    this.generation = 0;

    // Step 1: Always use InitializationOperator to create the population
    const initializationOperator = (config as any).initializationOperator || new GAInitializationOperator<T>();
    this.population = initializationOperator.initialize({
      populationSize: (config as any).populationSize || 100,
      individualFactory: (config as any).individualFactory
    });
    if (!Array.isArray(this.population) || this.population.length === 0) {
      throw new Error('InitializationOperator produced an empty population. This is not allowed.');
    }

    // Step 2: Evaluation
    const evaluationOperator = (config as any).evaluationOperator || new GAEvaluationOperator<T>(fitnessFunction as (ind: T) => number);
    this.bestSolution = this.population[0];
    this.bestFitness = evaluationOperator.evaluate(this.bestSolution);
    for (const individual of this.population) {
      const fitness = evaluationOperator.evaluate(individual);
      if (fitness > this.bestFitness) {
        this.bestFitness = fitness;
        this.bestSolution = individual;
      }
    }
  }

  async evolve(generations?: number): Promise<T> {
    const gens = generations || this.config.maxGenerations;
    const eliteCount = (this.config as any).eliteCount || 0;
    const fitnessLimit = (this.config as any).fitnessLimit;
    const result = await GALoopOperator({
      population: this.population,
      fitnessFunction: this.fitnessFunction,
      maxGenerations: gens,
      eliteCount,
      fitnessLimit,
      initializationOperator: (this.config as any).initializationOperator,
      evaluationOperator: (this.config as any).evaluationOperator,
      mutationOperator: (this.config as any).mutationOperator,
      crossoverOperator: (this.config as any).crossoverOperator
    });
    this.population = result.population;
    this.bestSolution = result.bestSolution;
    this.bestFitness = result.bestFitness;
    this.generation = result.generation;
    return this.bestSolution;
  }

  getBestSolution(): T {
    return this.bestSolution;
  }

  getBestFitness(): number {
    return this.bestFitness;
  }

  getPopulation(): T[] {
    return this.population;
  }

  getGeneration(): number {
    return this.generation;
  }
}

// Export components for advanced usage
export * from './components';
