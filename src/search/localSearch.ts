/**
 * Interface for defining the objective function to be optimized
 * @typeparam T - The type of solution representation
 */
export interface ObjectiveFunction<T> {
  (solution: T): number | Promise<number>;
}

/**
 * Interface for defining the cost function to break ties in objective value
 * @typeparam T - The type of solution representation
 */
export interface CostFunction<T> {
  (solution: T): number | Promise<number>;
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
  /**
   * Optional callback called on every climb (improvement)
   * Returns a Promise, but is not awaited (fire-and-forget)
   */
  onClimb?: (solution: any, fitness: number, iteration: number) => Promise<void>;
  /**
   * Optional cost function to break ties when objective values are equal
   */
  costFunction?: CostFunction<any>;
  /**
   * Whether to maximize (true) or minimize (false) the cost function (default: false)
   */
  maximizeCost?: boolean;
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
  public async search(
    initialSolution: T,
    objectiveFunction: ObjectiveFunction<T>,
    neighborhoodFunction: NeighborhoodFunction<T>,
    options: LocalSearchOptions = {}
  ): Promise<LocalSearchResult<T>> {
    const { maxIterations = 1000, maximize = true, randomRestarts = 1, randomInitializer, onClimb } = options;

    let bestSolution = initialSolution;
    let bestFitness = await objectiveFunction(initialSolution);
    let bestIterations = 0;

    for (let restart = 0; restart < randomRestarts; restart++) {
      let currentSolution = restart === 0 ? initialSolution : (randomInitializer ? randomInitializer() : initialSolution);
      let currentFitness = await objectiveFunction(currentSolution);
      let iterations = 0;
      let improved = true;

      while (improved && iterations < maxIterations) {
        improved = false;
        iterations++;
        const neighbors = neighborhoodFunction(currentSolution);
        for (const neighbor of neighbors) {
          const neighborFitness = await objectiveFunction(neighbor);
          const isImprovement = maximize
            ? neighborFitness > currentFitness
            : neighborFitness < currentFitness;
          let isTie = neighborFitness === currentFitness;
          let isCostImprovement = false;
          if (isTie && options.costFunction) {
            const currentCost = await options.costFunction(currentSolution);
            const neighborCost = await options.costFunction(neighbor);
            isCostImprovement = (options.maximizeCost ?? false)
              ? neighborCost > currentCost
              : neighborCost < currentCost;
          }
          if (isImprovement || (isTie && isCostImprovement)) {
            currentSolution = neighbor;
            currentFitness = neighborFitness;
            improved = true;
            if (onClimb) {
              onClimb(currentSolution, currentFitness, iterations);
            }
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
