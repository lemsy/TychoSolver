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

## License

This project is licensed under the Mozilla Public License 2.0 - see the LICENSE file for details.
