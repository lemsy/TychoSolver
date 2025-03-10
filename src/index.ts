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
 * Main genetic algorithm class
 */
export class GeneticAlgorithm<T> {
  private population: Individual<T>[] = [];
  private bestIndividual: Individual<T> | null = null;
  private generation = 0;
  
  // Configuration options
  private populationSize: number;
  private geneLength: number;
  private fitnessFunction: FitnessFunction<T>;
  private geneGenerator: GeneGenerator<T>;
  private selectionMethod: SelectionMethod<T>;
  private crossoverMethod: CrossoverMethod<T>;
  private mutationMethod: MutationMethod<T>;
  private crossoverRate: number;
  private mutationRate: number;
  private elitismCount: number;
  private maxGenerations: number;
  private targetFitness: number | undefined;

  constructor(options: GeneticAlgorithmOptions<T>) {
    // Set required parameters
    this.populationSize = options.populationSize;
    this.geneLength = options.geneLength;
    this.fitnessFunction = options.fitnessFunction;
    this.geneGenerator = options.geneGenerator;
    
    // Set optional parameters with defaults
    this.crossoverRate = options.crossoverRate ?? 0.8;
    this.mutationRate = options.mutationRate ?? 0.1;
    this.elitismCount = options.elitismCount ?? 1;
    this.maxGenerations = options.maxGenerations ?? 100;
    this.targetFitness = options.targetFitness;
    
    // Set default methods if not provided
    this.selectionMethod = options.selectionMethod ?? this.tournamentSelection;
    this.crossoverMethod = options.crossoverMethod ?? this.singlePointCrossover;
    this.mutationMethod = options.mutationMethod ?? this.standardMutation;
    
    // Initialize population
    this.initializePopulation();
  }

  /**
   * Initialize the population with random individuals
   */
  private initializePopulation(): void {
    this.population = [];
    for (let i = 0; i < this.populationSize; i++) {
      const genes: T[] = [];
      for (let j = 0; j < this.geneLength; j++) {
        genes.push(this.geneGenerator());
      }
      
      const individual: Individual<T> = {
        genes,
        fitness: 0
      };
      
      individual.fitness = this.fitnessFunction(individual.genes);
      this.population.push(individual);
    }
    
    // Find the best individual in the initial population
    this.updateBestIndividual();
  }

  /**
   * Update the best individual found so far
   */
  private updateBestIndividual(): void {
    const currentBest = this.getBestIndividual();
    
    if (!this.bestIndividual || currentBest.fitness > this.bestIndividual.fitness) {
      this.bestIndividual = {
        genes: [...currentBest.genes],
        fitness: currentBest.fitness
      };
    }
  }

  /**
   * Get the best individual from the current population
   */
  public getBestIndividual(): Individual<T> {
    return [...this.population].sort((a, b) => b.fitness - a.fitness)[0];
  }

  /**
   * Calculate the total fitness of the population
   */
  private calculateFitnessSum(): number {
    return this.population.reduce((sum, individual) => sum + individual.fitness, 0);
  }

  /**
   * Tournament selection method
   */
  private tournamentSelection = (population: Individual<T>[], fitnessSum: number): Individual<T> => {
    const tournamentSize = 3;
    let tournament: Individual<T>[] = [];
    
    // Select random individuals for the tournament
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }
    
    // Return the best individual from the tournament
    return [...tournament].sort((a, b) => b.fitness - a.fitness)[0];
  }

  /**
   * Roulette wheel selection method
   */
  private rouletteWheelSelection = (population: Individual<T>[], fitnessSum: number): Individual<T> => {
    const randomValue = Math.random() * fitnessSum;
    let currentSum = 0;
    
    for (const individual of population) {
      currentSum += individual.fitness;
      if (currentSum >= randomValue) {
        return individual;
      }
    }
    
    // Fallback in case of rounding errors
    return population[population.length - 1];
  }

  /**
   * Single-point crossover method
   */
  private singlePointCrossover = (parent1: Individual<T>, parent2: Individual<T>): [Individual<T>, Individual<T>] => {
    if (Math.random() > this.crossoverRate) {
      // No crossover, return copies of parents
      return [
        { genes: [...parent1.genes], fitness: 0 },
        { genes: [...parent2.genes], fitness: 0 }
      ];
    }
    
    // Perform crossover
    const crossoverPoint = Math.floor(Math.random() * (this.geneLength - 1)) + 1;
    
    const child1: Individual<T> = {
      genes: [
        ...parent1.genes.slice(0, crossoverPoint),
        ...parent2.genes.slice(crossoverPoint)
      ],
      fitness: 0
    };
    
    const child2: Individual<T> = {
      genes: [
        ...parent2.genes.slice(0, crossoverPoint),
        ...parent1.genes.slice(crossoverPoint)
      ],
      fitness: 0
    };
    
    return [child1, child2];
  }

  /**
   * Two-point crossover method
   */
  private twoPointCrossover = (parent1: Individual<T>, parent2: Individual<T>): [Individual<T>, Individual<T>] => {
    if (Math.random() > this.crossoverRate) {
      // No crossover, return copies of parents
      return [
        { genes: [...parent1.genes], fitness: 0 },
        { genes: [...parent2.genes], fitness: 0 }
      ];
    }
    
    // Select two crossover points
    let point1 = Math.floor(Math.random() * (this.geneLength - 1)) + 1;
    let point2 = Math.floor(Math.random() * (this.geneLength - point1)) + point1;
    
    const child1: Individual<T> = {
      genes: [
        ...parent1.genes.slice(0, point1),
        ...parent2.genes.slice(point1, point2),
        ...parent1.genes.slice(point2)
      ],
      fitness: 0
    };
    
    const child2: Individual<T> = {
      genes: [
        ...parent2.genes.slice(0, point1),
        ...parent1.genes.slice(point1, point2),
        ...parent2.genes.slice(point2)
      ],
      fitness: 0
    };
    
    return [child1, child2];
  }

  /**
   * Standard mutation method
   */
  private standardMutation = (individual: Individual<T>, geneGenerator: GeneGenerator<T>): void => {
    for (let i = 0; i < individual.genes.length; i++) {
      if (Math.random() < this.mutationRate) {
        individual.genes[i] = geneGenerator();
      }
    }
  }

  /**
   * Evolve the population to the next generation
   */
  public evolve(): void {
    const nextGeneration: Individual<T>[] = [];
    const fitnessSum = this.calculateFitnessSum();
    
    // Apply elitism if specified
    if (this.elitismCount > 0) {
      const sortedPopulation = [...this.population].sort((a, b) => b.fitness - a.fitness);
      for (let i = 0; i < this.elitismCount && i < sortedPopulation.length; i++) {
        nextGeneration.push({
          genes: [...sortedPopulation[i].genes],
          fitness: sortedPopulation[i].fitness
        });
      }
    }
    
    // Fill the rest of the population with crossover and mutation
    while (nextGeneration.length < this.populationSize) {
      // Select parents
      const parent1 = this.selectionMethod(this.population, fitnessSum);
      const parent2 = this.selectionMethod(this.population, fitnessSum);
      
      // Create offspring through crossover
      const [child1, child2] = this.crossoverMethod(parent1, parent2);
      
      // Apply mutation
      this.mutationMethod(child1, this.geneGenerator);
      this.mutationMethod(child2, this.geneGenerator);
      
      // Evaluate fitness
      child1.fitness = this.fitnessFunction(child1.genes);
      nextGeneration.push(child1);
      
      if (nextGeneration.length < this.populationSize) {
        child2.fitness = this.fitnessFunction(child2.genes);
        nextGeneration.push(child2);
      }
    }
    
    // Replace old population with new generation
    this.population = nextGeneration;
    this.generation++;
    
    // Update best individual
    this.updateBestIndividual();
  }

  /**
   * Run the genetic algorithm until a termination condition is met
   */
  public run(options: { 
    maxGenerations?: number, 
    targetFitness?: number,
    onGenerationComplete?: (data: { 
      generation: number, 
      bestFitness: number, 
      averageFitness: number, 
      bestIndividual: Individual<T> 
    }) => boolean 
  } = {}): Individual<T> {
    const maxGen = options.maxGenerations ?? this.maxGenerations;
    const targetFit = options.targetFitness ?? this.targetFitness;
    
    while (this.generation < maxGen) {
      this.evolve();
      
      // Calculate statistics
      const bestIndividual = this.getBestIndividual();
      const avgFitness = this.calculateFitnessSum() / this.populationSize;
      
      // Call generation callback if provided
      if (options.onGenerationComplete) {
        const shouldStop = options.onGenerationComplete({
          generation: this.generation,
          bestFitness: bestIndividual.fitness,
          averageFitness: avgFitness,
          bestIndividual: bestIndividual
        });
        
        if (shouldStop) {
          break;
        }
      }
      
      // Check if we've reached the target fitness
      if (targetFit !== undefined && bestIndividual.fitness >= targetFit) {
        break;
      }
    }
    
    if (!this.bestIndividual) {
      throw new Error("No best individual found");
    }
    
    return this.bestIndividual;
  }

  /**
   * Reset the algorithm to start from generation 0
   */
  public reset(): void {
    this.generation = 0;
    this.bestIndividual = null;
    this.initializePopulation();
  }

  /**
   * Get the current generation number
   */
  public getGeneration(): number {
    return this.generation;
  }

  /**
   * Get the current population
   */
  public getPopulation(): Individual<T>[] {
    return [...this.population];
  }

  /**
   * Get the best individual found so far
   */
  public getBest(): Individual<T> | null {
    return this.bestIndividual ? { ...this.bestIndividual } : null;
  }
}

// Export utility functions
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
