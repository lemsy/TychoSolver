/**
 * Genetic Algorithm implementation
 */

import { EvolutionaryAlgorithm, EvolutionaryConfig, FitnessFunction } from '../../core/types';
import { GAInitializationOperator } from './components/InitializationOperator';
import { GAEvaluationOperator } from './components/EvaluationOperator';
import { GATerminationOperator } from './components/TerminationOperator';
import { SelectionOperatorImpl } from './components/SelectionOperator';
import { CrossoverOperatorImpl } from './components/CrossoverOperator';
import { MutationOperatorImpl } from './components/MutationOperator';
import { ReplacementOperatorImpl } from './components/ReplacementOperator';
import { ElitismOperatorImpl } from './components/ElitismOperator';
import { GALoopOperator } from './components/GALoopOperator';
import { CrossoverOperator } from '../../core/operators/CrossoverOperator';
import { MutationOperator } from '../../core/operators/MutationOperator';
import { SelectionOperator } from '../../core/operators/SelectionOperator';
import { ReplacementOperator } from '../../core/operators/ReplacementOperator';
import { ElitismOperator } from '../../core/operators/ElitismOperator';

export class GeneticAlgorithm<T> implements EvolutionaryAlgorithm<T> {
  private population: T[];
  private bestSolution: T;
  private bestFitness: number;
  private generation: number;
  private config: EvolutionaryConfig;
  private fitnessFunction: FitnessFunction<T>;

  // Operators
  private initializationOperator: GAInitializationOperator<T>;
  private evaluationOperator: GAEvaluationOperator<T>;
  private terminationOperator: GATerminationOperator<T>;
  private selectionOperator: SelectionOperator<T>;
  private crossoverOperator: CrossoverOperator<T>;
  private mutationOperator: MutationOperator<T>;
  private replacementOperator: ReplacementOperator<T>;
  private elitismOperator: ElitismOperator<T>;

  constructor(
    initialPopulation: T[],
    fitnessFunction: FitnessFunction<T>,
    config: EvolutionaryConfig,
    operators?: {
      initializationOperator?: GAInitializationOperator<T>,
      evaluationOperator?: GAEvaluationOperator<T>,
      terminationOperator?: GATerminationOperator<T>,
      selectionOperator?: SelectionOperator<T>,
      crossoverOperator?: CrossoverOperator<T>,
      mutationOperator?: MutationOperator<T>,
      replacementOperator?: ReplacementOperator<T>,
      elitismOperator?: ElitismOperator<T>,
    }
  ) {
    this.population = initialPopulation;
    this.fitnessFunction = fitnessFunction;
    this.config = config;
    this.generation = 0;

    // Initialize operators (use provided or sensible defaults)
    this.initializationOperator = operators?.initializationOperator || new GAInitializationOperator<T>();
    this.evaluationOperator = operators?.evaluationOperator || new GAEvaluationOperator<T>(fitnessFunction);
    this.terminationOperator = operators?.terminationOperator || new GATerminationOperator<T>();
    this.selectionOperator = operators?.selectionOperator || (new SelectionOperatorImpl<T>() as SelectionOperator<T>);

    // Only provide default crossover/mutation for array-based individuals
    if (operators?.crossoverOperator) {
      this.crossoverOperator = operators.crossoverOperator;
    } else {
      try {
        this.crossoverOperator = new (CrossoverOperatorImpl as any)() as CrossoverOperator<T>;
      } catch {
        throw new Error('No default crossover operator for this individual type. Please provide one.');
      }
    }
    if (operators?.mutationOperator) {
      this.mutationOperator = operators.mutationOperator;
    } else {
      try {
        this.mutationOperator = new (MutationOperatorImpl as any)() as MutationOperator<T>;
      } catch {
        throw new Error('No default mutation operator for this individual type. Please provide one.');
      }
    }
    this.replacementOperator = operators?.replacementOperator || (new ReplacementOperatorImpl<T>() as ReplacementOperator<T>);
    this.elitismOperator = operators?.elitismOperator || (new ElitismOperatorImpl<T>() as ElitismOperator<T>);

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
      evaluationOperator: this.evaluationOperator,
      selectionOperator: this.selectionOperator,
      crossoverOperator: this.crossoverOperator,
      mutationOperator: this.mutationOperator,
      replacementOperator: this.replacementOperator,
      elitismOperator: this.elitismOperator,
      terminationOperator: this.terminationOperator,
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
