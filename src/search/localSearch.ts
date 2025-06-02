/**
 * Interface for defining the objective function to be optimized
 * @typeparam T - The type of solution representation
 */
export interface ObjectiveFunction<T> {
  (solution: T): number;
}

/**
 * Interface for defining how to generate neighboring solutions
 * @typeparam T - The type of solution representation
 */
export interface NeighborhoodFunction<T> {
  (solution: T): T[];
}

/**
 * Options for configuring the local search algorithm
 */
export interface LocalSearchOptions {
  /** Maximum number of iterations */
  maxIterations?: number;
  /** Whether to maximize (true) or minimize (false) the objective function */
  maximize?: boolean;
  /** Number of random restarts (default: 1, i.e., no restart) */
  randomRestarts?: number;
  /** Function to generate a random initial solution for restarts */
  randomInitializer?: () => any;
}

/**
 * Result of a local search operation
 */
export interface LocalSearchResult<T> {
  /** The best solution found */
  solution: T;
  /** The objective function value of the best solution */
  fitness: number;
  /** The number of iterations performed */
  iterations: number;
}

/**
 * Local search algorithm implementation
 * Performs hill climbing to find a local optimum
 */
export class LocalSearch<T> {
  /**
   * Performs local search to find a local optimum
   * @param initialSolution - The starting solution
   * @param objectiveFunction - Function to evaluate solutions
   * @param neighborhoodFunction - Function to generate neighboring solutions
   * @param options - Configuration options
   * @returns The best solution found and associated information
   */
  public search(
    initialSolution: T,
    objectiveFunction: ObjectiveFunction<T>,
    neighborhoodFunction: NeighborhoodFunction<T>,
    options: LocalSearchOptions = {}
  ): LocalSearchResult<T> {
    const { maxIterations = 1000, maximize = true, randomRestarts = 1, randomInitializer } = options;

    let bestSolution = initialSolution;
    let bestFitness = objectiveFunction(initialSolution);
    let bestIterations = 0;

    for (let restart = 0; restart < randomRestarts; restart++) {
      let currentSolution = restart === 0 ? initialSolution : (randomInitializer ? randomInitializer() : initialSolution);
      let currentFitness = objectiveFunction(currentSolution);
      let iterations = 0;
      let improved = true;

      while (improved && iterations < maxIterations) {
        improved = false;
        iterations++;
        const neighbors = neighborhoodFunction(currentSolution);
        for (const neighbor of neighbors) {
          const neighborFitness = objectiveFunction(neighbor);
          const isImprovement = maximize
            ? neighborFitness > currentFitness
            : neighborFitness < currentFitness;
          if (isImprovement) {
            currentSolution = neighbor;
            currentFitness = neighborFitness;
            improved = true;
            break;
          }
        }
      }
      if ((maximize && currentFitness > bestFitness) || (!maximize && currentFitness < bestFitness)) {
        bestSolution = currentSolution;
        bestFitness = currentFitness;
        bestIterations = iterations;
      }
    }
    return {
      solution: bestSolution,
      fitness: bestFitness,
      iterations: bestIterations
    };
  }
}
