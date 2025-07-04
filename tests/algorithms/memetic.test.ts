import { MemeticAlgorithm, Individual } from '../../src/algorithms/memetic';
import { NeighborhoodFunction, ObjectiveFunction } from '../../src/search/types';
import {
    GAInitializationOperator
} from '../../src/algorithms/genetic/components/InitializationOperator';
import { GAEvaluationOperator } from '../../src/algorithms/genetic/components/EvaluationOperator';
import { SelectionOperatorImpl } from '../../src/algorithms/genetic/components/SelectionOperator';
import { CrossoverOperatorImpl } from '../../src/algorithms/genetic/components/CrossoverOperator';
import { MutationOperatorImpl } from '../../src/algorithms/genetic/components/MutationOperator';
import { MemeticInitializationOperator } from '../../src/algorithms/memetic/components/MemeticInitializationOperator';

describe('MemeticAlgorithm', () => {
    it('should return a solution for a simple numerical problem', async () => {
        // Example problem: maximize f(x) = x^2 for x in [0, 10]
        const fitness = (x: number) => x * x;
        const individualFactory = () => Math.floor(Math.random() * 11);
        const initializationOperator = new MemeticInitializationOperator<number>(individualFactory);
        const evaluationOperator = new GAEvaluationOperator<number>(fitness);
        const selectionOperator = new SelectionOperatorImpl<Individual<number>>();
        const crossoverOperator = {
            crossover: (a: number, b: number) => [Math.round((a + b) / 2), Math.round((a + b) / 2)] as [number, number]
        };
        const mutationOperator = {
            mutate: (individual: number) => Math.max(0, Math.min(10, individual + (Math.random() < 0.5 ? 1 : -1)))
        };

        // Define neighborhood function for local search
        const neighborhoodFunction: NeighborhoodFunction<number> = (individual: number) => {
            const neighbors: number[] = [];
            const x = individual;

            // Add neighbors +1 and -1 from current value (if within bounds)
            if (x < 10) {
                neighbors.push(x + 1);
            }
            if (x > 0) {
                neighbors.push(x - 1);
            }

            return neighbors;
        };

        const algo = new MemeticAlgorithm<number>({
            populationSize: 10,
            generations: 20,
            crossoverRate: 0.7,
            mutationRate: 0.1,
            localSearchRate: 0.3,
            initializationOperator,
            evaluationOperator,
            selectionOperator,
            crossoverOperator,
            mutationOperator,
            individualFactory,
            objectiveFunction: fitness,
            neighborhoodFunction,
            localSearchOptions: {
                maxIterations: 5,
                maximize: true
            }
        });

        const result = await algo.evolve();
        expect(result.genome).toBeGreaterThanOrEqual(0);
        expect(result.genome).toBeLessThanOrEqual(10);
        // The best solution should be 10 (since 10^2 = 100 is max)
        expect(result.genome).toBe(10);
        expect(result.fitness).toBe(100);
    });

    it('should solve a binary optimization problem', async () => {
        // Define a binary optimization problem (maximize number of 1s)
        type BinaryGenome = number[];
        const GENOME_LENGTH = 20;

        // Create a random binary genome
        const individualFactory = () => Array.from({ length: GENOME_LENGTH }, () => Math.round(Math.random()));
        // Ensure a new initializationOperator is created with the correct factory
        const initializationOperator = new MemeticInitializationOperator<BinaryGenome>(individualFactory);
        const countOnes = (genome: BinaryGenome) => genome.reduce((sum, gene) => sum + gene, 0);
        const evaluationOperator = new GAEvaluationOperator<BinaryGenome>(countOnes);
        const selectionOperator = new SelectionOperatorImpl<Individual<BinaryGenome>>();
        const crossoverOperator = new CrossoverOperatorImpl<BinaryGenome>();
        const mutationOperator = new MutationOperatorImpl<BinaryGenome>(
            (gene) => 1 - gene
        );

        // Generate neighborhood by flipping one bit at a time
        const flipOneBitNeighborhood: NeighborhoodFunction<BinaryGenome> = (genome: BinaryGenome) => {
            const neighbors: BinaryGenome[] = [];

            for (let i = 0; i < genome.length; i++) {
                const neighborGenome = [...genome];
                neighborGenome[i] = 1 - neighborGenome[i]; // Flip 0 to 1 or 1 to 0
                neighbors.push(neighborGenome);
            }

            return neighbors;
        };

        const algo = new MemeticAlgorithm<BinaryGenome>({
            populationSize: 20,
            generations: 10,
            crossoverRate: 0.8,
            mutationRate: 0.1,
            localSearchRate: 0.2,
            initializationOperator,
            evaluationOperator,
            selectionOperator,
            crossoverOperator,
            mutationOperator,
            individualFactory,
            objectiveFunction: countOnes,
            neighborhoodFunction: flipOneBitNeighborhood,
            localSearchOptions: {
                maxIterations: 5,
                maximize: true
            }
        });

        const result = await algo.evolve();
        expect(Array.isArray(result.genome)).toBe(true);
        expect(result.genome.length).toBe(GENOME_LENGTH);

        // Given enough iterations, all bits should be 1s (or very close)
        const countOfOnes = result.genome.filter(bit => bit === 1).length;
        expect(countOfOnes).toBeGreaterThanOrEqual(GENOME_LENGTH * 0.9); // At least 90% of bits should be 1
        expect(result.fitness).toBe(countOfOnes);
    });
});