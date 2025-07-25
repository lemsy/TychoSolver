# Usage Examples

This document shows how to import and use various components from TychoSolver.

## Basic Imports

```typescript
import { 
  GeneticAlgorithm,
  LocalSearch,
  EvolutionaryConfig,
  LocalSearchOptions 
} from 'tycho-solver';
```

## Core Types and Interfaces

```typescript
import { 
  FitnessFunction,
  EvolutionaryConfig, 
  EvolutionaryAlgorithm,
  ObjectiveFunction,
  NeighborhoodFunction 
} from 'tycho-solver';
```

## Advanced Usage - Individual Components

```typescript
// Core operators
import { 
  CrossoverOperator, 
  MutationOperator, 
  SelectionOperator 
} from 'tycho-solver';

// Genetic algorithm components
import { 
  GAInitializationOperator,
  CrossoverOperatorImpl 
} from 'tycho-solver';

// Search components
import { 
  RandomRestartsOperator,
  SearchLoopOperator 
} from 'tycho-solver';
```

## Parallel Processing

```typescript
import { ParallelLocalSearch } from 'tycho-solver';
```

## Utilities

```typescript
import { random, randomInt, geneticAlgorithmUtils } from 'tycho-solver';
```

All these imports are now properly exported and available for use in your applications!
