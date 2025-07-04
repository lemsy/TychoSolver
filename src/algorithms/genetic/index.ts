/**
 * Genetic Algorithm implementation
 */

import { EvolutionaryAlgorithm, EvolutionaryConfig, FitnessFunction } from '../../core/types';
import { GALoopOperator } from './components/GALoopOperator';

export class GeneticAlgorithm<T> implements EvolutionaryAlgorithm<T> {
  private population: T[];
  private bestSolution: T;
  private bestFitness: number;
  private generation: number;
  private config: EvolutionaryConfig;
  private fitnessFunction: FitnessFunction<T>;

  constructor(
    initialPopulation: T[],
    fitnessFunction: FitnessFunction<T>,
    config: EvolutionaryConfig
  ) {
    this.population = initialPopulation;
    this.fitnessFunction = fitnessFunction;
    this.config = config;
    this.generation = 0;

    // Initialize best solution
    this.bestSolution = this.population[0];
    this.bestFitness = this.fitnessFunction(this.bestSolution);
    this.updateBest();
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
      fitnessLimit
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

  private updateBest(): void {
    for (const individual of this.population) {
      const fitness = this.fitnessFunction(individual);
      if (fitness > this.bestFitness) {
        this.bestFitness = fitness;
        this.bestSolution = individual;
      }
    }
  }
}
