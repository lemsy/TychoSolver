# Tycho Solver

A modular and extensible library for evolutionary computation and optimization problems.

## Features

- Genetic Algorithm implementation
- Configurable selection, crossover and mutation operators
- TypeScript support with full type definitions
- Modular architecture for easy extension

## Installation

```bash
npm install tycho-solver
```

## Quick Start

```typescript
import { GeneticAlgorithm } from 'tycho-solver';

// Define a simple problem: find a list of numbers that sum to a target value
const target = 100;
const populationSize = 50;
const numGenes = 10;

// Initialize with random numbers between 0 and 20
const initialPopulation = Array.from({ length: populationSize }, () => 
  Array.from({ length: numGenes }, () => Math.floor(Math.random() * 21))
);

// Fitness function: higher is better when sum is closer to target
const fitnessFunction = (individual: number[]) => {
  const sum = individual.reduce((a, b) => a + b, 0);
  return 1000 - Math.abs(sum - target);
};

// Configure and run the genetic algorithm
const ga = new GeneticAlgorithm(
  initialPopulation,
  fitnessFunction,
  {
    populationSize: populationSize,
    maxGenerations: 100,
    crossoverRate: 0.8,
    mutationRate: 0.2
  }
);

// Run the evolution
const solution = ga.evolve();
console.log('Best solution:', solution);
console.log('Fitness:', ga.getBestFitness());
```

## Examples

### Genetic Algorithm

The genetic algorithm is ideal for problems where you need to find solutions in a large search space:

```typescript
import { GeneticAlgorithm } from 'tycho-solver';

// Example: Binary knapsack problem
// Items with values and weights
const items = [
  { value: 4, weight: 12 },
  { value: 2, weight: 2 },
  { value: 10, weight: 4 },
  { value: 1, weight: 1 },
  { value: 2, weight: 2 }
];
const maxWeight = 15;

// Initialize a random population (0 = item not taken, 1 = item taken)
const populationSize = 50;
const initialPopulation = Array.from({ length: populationSize }, () => 
  Array.from({ length: items.length }, () => Math.round(Math.random()))
);

// Fitness function - evaluate each solution
const fitnessFunction = (individual: number[]) => {
  const totalValue = individual.reduce((sum, gene, index) => 
    sum + (gene * items[index].value), 0);
  const totalWeight = individual.reduce((sum, gene, index) => 
    sum + (gene * items[index].weight), 0);
    
  // Return 0 fitness if solution exceeds weight constraint
  return totalWeight <= maxWeight ? totalValue : 0;
};

// Configure and run the genetic algorithm
const ga = new GeneticAlgorithm(
  initialPopulation,
  fitnessFunction,
  {
    populationSize: populationSize,
    maxGenerations: 100,
    crossoverRate: 0.8,
    mutationRate: 0.1,
    elitism: 2 // Keep the best 2 individuals
  }
);

// Run the evolution
const solution = ga.evolve();
console.log('Best solution:', solution);
console.log('Fitness:', ga.getBestFitness());
```

### Memetic Algorithm

Memetic algorithms combine global search (genetic algorithm) with local search to refine solutions. You must provide custom operator functions (e.g., selection, crossover, mutation, evaluation, neighborhood) as part of the configuration:

```typescript
import { MemeticAlgorithm } from 'tycho-solver';

// Example: Traveling Salesman Problem (TSP)
const cities = [
  { x: 60, y: 200 },
  { x: 180, y: 200 },
  { x: 80, y: 180 },
  { x: 140, y: 180 },
  { x: 20, y: 160 },
  { x: 100, y: 160 },
  { x: 200, y: 160 }
];

const distance = (city1, city2) => {
  return Math.sqrt(Math.pow(city1.x - city2.x, 2) + Math.pow(city1.y - city2.y, 2));
};

const memeticOptions = {
  populationSize: 30,
  generations: 50,
  crossoverRate: 0.9,
  mutationRate: 0.2,
  localSearchRate: 0.3,
  initialize: () => {
    const indices = Array.from({ length: cities.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  },
  evaluate: (route) => {
    let totalDistance = 0;
    for (let i = 0; i < route.length; i++) {
      const from = cities[route[i]];
      const to = cities[(route[(i + 1) % route.length])];
      totalDistance += distance(from, to);
    }
    return 1000 / totalDistance;
  },
  select: (population) => {
    const tournament = (size = 3) => {
      const contestants = Array.from({ length: size }, () =>
        population[Math.floor(Math.random() * population.length)]
      );
      return contestants.reduce((best, ind) =>
        ind.fitness > best.fitness ? ind : best, contestants[0]
      );
    };
    return [tournament(), tournament()];
  },
  crossover: (parent1, parent2) => {
    const size = parent1.length;
    const start = Math.floor(Math.random() * size);
    const end = start + Math.floor(Math.random() * (size - start));
    const offspring = Array(size).fill(-1);
    for (let i = start; i <= end; i++) {
      offspring[i] = parent1[i];
    }
    let j = (end + 1) % size;
    for (let i = 0; i < size; i++) {
      const nextPos = (end + 1 + i) % size;
      if (offspring[nextPos] === -1) {
        while (offspring.includes(parent2[j])) {
          j = (j + 1) % size;
        }
        offspring[nextPos] = parent2[j];
      }
    }
    return offspring;
  },
  mutate: (genome) => {
    const genomeCopy = [...genome];
    const idx1 = Math.floor(Math.random() * genomeCopy.length);
    let idx2 = Math.floor(Math.random() * genomeCopy.length);
    while (idx1 === idx2) {
      idx2 = Math.floor(Math.random() * genomeCopy.length);
    }
    [genomeCopy[idx1], genomeCopy[idx2]] = [genomeCopy[idx2], genomeCopy[idx1]];
    return genomeCopy;
  },
  neighborhoodFunction: (route) => {
    const neighbors = [];
    for (let i = 0; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const newRoute = [...route];
        let left = i;
        let right = j;
        while (left < right) {
          [newRoute[left], newRoute[right]] = [newRoute[right], newRoute[left]];
          left++;
          right--;
        }
        neighbors.push(newRoute);
      }
    }
    return neighbors.slice(0, 10);
  },
  localSearchOptions: {
    maxIterations: 20,
    maximize: true
  }
};

// Run the memetic algorithm as a class
const memetic = new MemeticAlgorithm(memeticOptions);
memetic.initializePopulation().then(async () => {
  const bestSolution = await memetic.evolve();
  console.log('Best route:', bestSolution.genome);
  console.log('Fitness:', bestSolution.fitness);
});
```

### Local Search

Local search algorithms are useful for refining solutions or solving optimization problems directly:

```typescript
import { LocalSearch } from 'tycho-solver';

// Example: Function optimization - find minimum of a 2D function
// Function to optimize: f(x,y) = (x-2)² + (y-3)² + 1
const objectiveFunction = (solution: [number, number]): number => {
  const [x, y] = solution;
  return Math.pow(x - 2, 2) + Math.pow(y - 3, 2) + 1;
};

// Neighborhood function - generate nearby points
const neighborhoodFunction = (solution: [number, number]): [number, number][] => {
  const [x, y] = solution;
  const stepSize = 0.1;
  
  return [
    [x + stepSize, y],
    [x - stepSize, y],
    [x, y + stepSize],
    [x, y - stepSize],
    [x + stepSize, y + stepSize],
    [x - stepSize, y - stepSize],
    [x + stepSize, y - stepSize],
    [x - stepSize, y + stepSize]
  ];
};

// Create and configure the local search
const localSearch = new LocalSearch<[number, number]>();

// Initial solution [0, 0]
const initialSolution: [number, number] = [0, 0];

// Run the search
const result = localSearch.search(
  initialSolution,
  objectiveFunction,
  neighborhoodFunction,
  {
    maxIterations: 1000,
    maximize: false // We're minimizing the function
  }
);

console.log('Best solution found:', result.solution);
console.log('Objective value:', result.fitness);
console.log('Iterations performed:', result.iterations);
```

## API Documentation

### Core Types

```typescript
// Fitness function that evaluates the quality of a solution
type FitnessFunction<T> = (individual: T) => number;

// Configuration options for evolutionary algorithms
interface EvolutionaryConfig {
  populationSize: number;
  maxGenerations: number;
  selectionPressure?: number;
  mutationRate?: number;
  crossoverRate?: number;
  elitism?: number;
}
```

### GeneticAlgorithm

The main class for creating and running genetic algorithms:

```typescript
class GeneticAlgorithm<T> implements EvolutionaryAlgorithm<T> {
  constructor(initialPopulation: T[], fitnessFunction: FitnessFunction<T>, config: EvolutionaryConfig);
  evolve(generations?: number): T;
  getBestSolution(): T;
  getBestFitness(): number;
  getPopulation(): T[];
  getGeneration(): number;
}
```

### MemeticAlgorithm

A class for creating and running memetic algorithms that combine genetic algorithms with local search. You must provide all operator functions (see example above):

```typescript
class MemeticAlgorithm<T> {
  constructor(config: MemeticOptions<T>);
  initializePopulation(): Promise<void>;
  evolve(): Promise<Individual<T>>;
  getBestIndividual(): Individual<T>;
  getPopulation(): Individual<T>[];
}
```

### LocalSearch

A general-purpose local search algorithm implementation:

```typescript
interface ObjectiveFunction<T> {
  (solution: T): number;
}

interface NeighborhoodFunction<T> {
  (solution: T): T[];
}

interface LocalSearchOptions {
  maxIterations?: number;  // Default: 1000
  maximize?: boolean;  // Default: true
}

interface LocalSearchResult<T> {
  solution: T;  // Best solution found
  fitness: number;  // Objective value of the best solution
  iterations: number;  // Number of iterations performed
}

class LocalSearch<T> {
  search(
    initialSolution: T,
    objectiveFunction: ObjectiveFunction<T>,
    neighborhoodFunction: NeighborhoodFunction<T>,
    options?: LocalSearchOptions
  ): LocalSearchResult<T>;
}
```

## Custom Functions and Operators

### GeneticAlgorithm

When using `GeneticAlgorithm`, you must provide the following:

| Parameter/Operator | Signature | Description |
|-------------------|-----------|-------------|
| initialPopulation | `T[]` | Array of individuals to start the population |
| fitnessFunction | `(individual: T) => number` | Computes the fitness of an individual |

You may also provide these configuration options (see API for all):
- `populationSize`: `number` (size of the population)
- `maxGenerations`: `number` (number of generations to run)
- `crossoverRate`: `number` (probability of crossover)
- `mutationRate`: `number` (probability of mutation)
- `elitism`: `number` (number of best individuals to keep)

If your implementation allows custom selection, crossover, or mutation operators, document their signatures here as well.

### MemeticAlgorithm

When using `MemeticAlgorithm`, you must provide the following operator functions in the configuration object:

| Operator              | Signature                                              | Description                                      |
|-----------------------|-------------------------------------------------------|--------------------------------------------------|
| initialize            | () => T                                               | Generates a random individual                    |
| evaluate              | (individual: T) => number                             | Computes the fitness of an individual            |
| select                | (population: Individual<T>[]) => [Individual<T>, Individual<T>] | Selects parents for crossover           |
| crossover             | (parent1: T, parent2: T) => T                         | Combines two parents to produce an offspring     |
| mutate                | (individual: T) => T                                  | Mutates an individual                            |
| neighborhoodFunction  | (individual: T) => T[]                                | Generates neighbors for local search             |

You may also provide:
- `localSearchOptions`: `{ maxIterations?: number, maximize?: boolean }`
- `localSearchRate`: `number` (probability to apply local search)

See the example above for sample implementations of each operator.

### LocalSearch

When using `LocalSearch`, you must provide the following functions:

| Function | Signature | Description |
|----------|-----------|-------------|
| objectiveFunction | `(solution: T) => number` | Computes the objective value (fitness) of a solution |
| neighborhoodFunction | `(solution: T) => T[]` | Generates neighboring solutions |

You may also provide:
- `maxIterations`: `number` (maximum number of iterations, default: 1000)
- `maximize`: `boolean` (whether to maximize or minimize, default: true)

See the examples above for sample implementations of each function.

## License

This project is licensed under the Mozilla Public License 2.0 - see the LICENSE file for details.
