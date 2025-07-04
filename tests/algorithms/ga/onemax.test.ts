/// <reference types="jest" />
import { GeneticAlgorithm } from '../../../src/algorithms/genetic';
import { MutationOperatorImpl } from '../../../src/algorithms/genetic/components/MutationOperator';

describe('Genetic Algorithm OneMax problem', () => {
    it('should solve the OneMax problem', async () => {
        // OneMax: maximize the number of 1s in a bitstring
        const bitLength = 10;
        const initialPopulation = Array.from({ length: 10 }, () =>
            Array.from({ length: bitLength }, () => Math.random() < 0.5 ? 0 : 1)
        );
        const fitnessFunction = (individual: number[]) => individual.reduce((a, b) => a + b, 0);
        const mutationOperator = new MutationOperatorImpl<number[]>(
            (gene) => gene === 0 ? 1 : 0,
            0.2 // mutationRate
        );
        const config = {
            populationSize: 10,
            maxGenerations: 50,
            mutationRate: 0.2,
            crossoverRate: 0.7,
            initializationOperator: { initialize: () => initialPopulation },
            mutationOperator
        };
        const ga = new GeneticAlgorithm(fitnessFunction, config);
        const best = await ga.evolve();
        // The best solution should be all 1s or very close
        expect(fitnessFunction(best)).toBeGreaterThanOrEqual(bitLength - 2);
    });
});
