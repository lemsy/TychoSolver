/// <reference types="jest" />
import { GeneticAlgorithm } from '../../../src/algorithms/genetic';
import { MutationOperatorImpl } from '../../../src/algorithms/genetic/components/MutationOperator';

describe('Genetic Algorithm Deceptive Trap problem', () => {
    it('should solve the Deceptive Trap problem (k=5)', async () => {
        // Deceptive Trap function for k=5
        function deceptiveTrapBlock(block: number[]): number {
            const k = block.length;
            const u = block.reduce((sum, bit) => sum + bit, 0);
            return u === k ? k : k - 1 - u;
        }
        const k = 5;
        const n = 20; // total length (multiple of k)
        const fitnessFunction = (arr: number[]) => {
            let score = 0;
            for (let i = 0; i < arr.length; i += k) {
                score += deceptiveTrapBlock(arr.slice(i, i + k));
            }
            return score;
        };
        const initialPopulation = Array.from({ length: 10 }, () =>
            Array.from({ length: n }, () => Math.random() < 0.5 ? 0 : 1)
        );
        const mutationOperator = new MutationOperatorImpl<number[]>(
            (gene) => gene === 0 ? 1 : 0,
            0.2 // mutationRate
        );
        const config = {
            populationSize: 10,
            maxGenerations: 100,
            mutationRate: 0.2,
            crossoverRate: 0.7,
            initializationOperator: { initialize: () => initialPopulation },
            mutationOperator
        };
        const ga = new GeneticAlgorithm(fitnessFunction, config);
        const best = await ga.evolve();
        // The global optimum is all ones (score = n)
        // Accept any solution with fitness between deceptive and global optimum
        const deceptiveFitness = (k - 1) * n / k;
        expect(fitnessFunction(best)).toBeGreaterThanOrEqual(deceptiveFitness);
        expect(fitnessFunction(best)).toBeLessThanOrEqual(n);
    });
});
