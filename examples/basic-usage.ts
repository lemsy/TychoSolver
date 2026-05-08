// Basic usage examples for TychoSolver library

import {
    GeneticAlgorithm,
    LocalSearch,
    EvolutionaryConfig,
    LocalSearchOptions,
    ObjectiveFunction,
    NeighborhoodFunction
} from '../src/index';
import { logger } from '../src/utils';

// Example 1: Simple Genetic Algorithm
function basicGeneticAlgorithmExample() {
    // For the new GeneticAlgorithm, we need to use the core FitnessFunction type
    const fitnessFunction = (individual: number[]) => {
        // OneMax problem: count the number of 1s
        return individual.reduce((sum, gene) => sum + gene, 0);
    };

    const config: EvolutionaryConfig = {
        populationSize: 50,
        maxGenerations: 100
    };

    const ga = new GeneticAlgorithm(fitnessFunction, config);

    logger.info('Running Genetic Algorithm...');
    // ga.evolve().then(result => logger.info('Best solution:', result));
}

// Example 2: Local Search
function basicLocalSearchExample() {
    const objectiveFunction: ObjectiveFunction<number[]> = (solution) => {
        // OneMax problem
        return solution.reduce((sum, bit) => sum + bit, 0);
    };

    const neighborhoodFunction: NeighborhoodFunction<number[]> = (solution) => {
        const neighbors: number[][] = [];
        for (let i = 0; i < solution.length; i++) {
            const neighbor = [...solution];
            neighbor[i] = 1 - neighbor[i]; // Flip bit
            neighbors.push(neighbor);
        }
        return neighbors;
    };

    const initialSolution = [0, 1, 0, 1, 0, 1, 0, 1];
    const options: LocalSearchOptions<number[]> = {
        maxIterations: 100,
        maximize: true
    };

    const localSearch = new LocalSearch<number[]>();

    logger.info('Running Local Search...');
    // localSearch.search(initialSolution, objectiveFunction, neighborhoodFunction, options)
    //   .then(result => logger.info('Best solution:', result));
}

// Example 3: Using specific operators for advanced usage
function advancedUsageExample() {
    // Import specific components for custom configurations
    // This shows how users can access individual operators
    logger.info('Advanced usage with custom operators...');
}

// Run examples
logger.info('TychoSolver Usage Examples');
logger.info('==========================');
basicGeneticAlgorithmExample();
basicLocalSearchExample();
advancedUsageExample();
