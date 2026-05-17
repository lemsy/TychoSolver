/**
 * Genetic Algorithm implementation
 */

import { EvolutionaryAlgorithm, EvolutionaryConfig, FitnessFunction } from '../../core/types';
import { GALoopOperator } from './components/GALoopOperator';
import { GAInitializationOperator } from './components/InitializationOperator';
import { GAEvaluationOperator } from './components/EvaluationOperator';
import { RNG, seededRandom } from '../../utils/rng';

export class GeneticAlgorithm<T> implements EvolutionaryAlgorithm<T> {
  private population: T[];
  private bestSolution: T;
  private bestFitness: number;
  private generation: number;
  private config: EvolutionaryConfig<T>;
  private fitnessFunction: FitnessFunction<T>;
  private rng?: RNG;

  constructor(
    fitnessFunction: FitnessFunction<T>,
    config: EvolutionaryConfig<T>
  ) {
    this.fitnessFunction = fitnessFunction;
    this.config = config;
    this.generation = 0;

    // RNG: create seeded RNG if seed provided, or use provided rng
    const seed = config.seed as number | undefined;
    const rng: RNG = config.rng || seededRandom(seed);
    this.rng = rng;

    // Step 1: Always use InitializationOperator to create the population
    const initializationOperator = config.initializationOperator || new GAInitializationOperator<T>();
    const initResult = initializationOperator.initialize({
      populationSize: config.populationSize || 100,
      individualFactory: config.individualFactory,
      rng
    });
    // `initialize` may be async in other operators; GeneticAlgorithm constructor is synchronous
    // so reject async initialization here to keep `this.population` a T[].
    if (initResult && typeof (initResult as any).then === 'function') {
      throw new Error('Asynchronous initialization is not supported in GeneticAlgorithm constructor. Provide a synchronous InitializationOperator or use a factory that awaits initialization.');
    }
    this.population = initResult as T[];
    if (!Array.isArray(this.population) || this.population.length === 0) {
      throw new Error('InitializationOperator produced an empty population. This is not allowed.');
    }

    // Step 2: Evaluation
    const evaluationOperator = config.evaluationOperator || new GAEvaluationOperator<T>(fitnessFunction as (ind: T) => number);
    this.bestSolution = this.population[0];
    const initialEval = evaluationOperator.evaluate(this.bestSolution);
    if (initialEval && typeof (initialEval as any).then === 'function') {
      throw new Error('Asynchronous evaluation is not supported in GeneticAlgorithm constructor. Provide a synchronous EvaluationOperator.');
    }
    this.bestFitness = initialEval as number;
    for (const individual of this.population) {
      const fitnessResult = evaluationOperator.evaluate(individual);
      if (fitnessResult && typeof (fitnessResult as any).then === 'function') {
        throw new Error('Asynchronous evaluation is not supported in GeneticAlgorithm constructor. Provide a synchronous EvaluationOperator.');
      }
      const fitness = fitnessResult as number;
      if (fitness > this.bestFitness) {
        this.bestFitness = fitness;
        this.bestSolution = individual;
      }
    }
  }

  async evolve(generations?: number): Promise<T> {
    const gens = generations || this.config.maxGenerations;
    const eliteCount = this.config.eliteCount ?? 1;
    const fitnessLimit = this.config.fitnessLimit;
    const result = await GALoopOperator({
      population: this.population,
      fitnessFunction: this.fitnessFunction,
      maxGenerations: gens,
      eliteCount,
      fitnessLimit,
      initializationOperator: this.config.initializationOperator,
      evaluationOperator: this.config.evaluationOperator,
      mutationOperator: this.config.mutationOperator,
      crossoverOperator: this.config.crossoverOperator,
      rng: this.rng
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
