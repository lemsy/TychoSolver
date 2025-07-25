// Advanced import examples showing all available exports

// Core types and interfaces
import type {
    FitnessFunction as CoreFitnessFunction,
    EvolutionaryConfig,
    EvolutionaryAlgorithm
} from '../src/core/types';

// Algorithm classes
import {
    GeneticAlgorithm,
    MemeticAlgorithm
} from '../src/algorithms';

// Search functionality
import {
    LocalSearch,
    LocalSearchOptions,
    LocalSearchResult,
    ObjectiveFunction,
    NeighborhoodFunction
} from '../src/search';

// Parallel computation
import {
    ParallelLocalSearch
} from '../src/parallel';

// Core operators (for advanced usage)
import type {
    CrossoverOperator,
    MutationOperator,
    SelectionOperator,
    InitializationOperator,
    EvaluationOperator
} from '../src/core/operators';

// Genetic algorithm components (for advanced usage)
import {
    GAInitializationOperator,
    CrossoverOperatorImpl
} from '../src/algorithms/genetic/components';

// Search components (for advanced usage)
import {
    RandomRestartsOperator,
    SearchLoopOperator,
    NeighborhoodOperator
} from '../src/search/components';

// Utility functions
import {
    random,
    randomInt
} from '../src/utils';

// Legacy GA utilities (still available from main index)
import {
    Individual,
    GeneticAlgorithmOptions,
    geneticAlgorithmUtils
} from '../src/index';

console.log('All advanced imports work correctly!');

// Example of using advanced components
function advancedComponentExample() {
    // Custom initialization operator
    const customInit = new GAInitializationOperator<number[]>();

    // Custom crossover operator  
    const customCrossover = new CrossoverOperatorImpl<number[]>();

    console.log('Custom operators created successfully');
}
