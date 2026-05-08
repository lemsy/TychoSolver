/// <reference types="jest" />
import { GeneticAlgorithm } from '../../src/algorithms/genetic';
import type { InitializationOperator } from '../../src/core/operators/InitializationOperator';

describe('Reproducible OneMax with seed', () => {
    it('should produce same best fitness for same seed', async () => {
        const bitLength = 20;
        // Seeded initialization operator that uses config.rng
        class SeededInit implements InitializationOperator<number[]> {
            initialize(config: any): number[][] {
                const populationSize = config.populationSize || 20;
                const rng = config.rng;
                const pop: number[][] = [];
                for (let i = 0; i < populationSize; i++) {
                    const individual: number[] = [];
                    for (let b = 0; b < bitLength; b++) {
                        const r = rng ? rng.random() : Math.random();
                        individual.push(r < 0.5 ? 0 : 1);
                    }
                    pop.push(individual);
                }
                return pop;
            }
        }

        const fitness = (ind: number[]) => ind.reduce((a, b) => a + b, 0);

        const config = {
            populationSize: 30,
            maxGenerations: 30,
            seed: 123456
        } as any;

        const ga1 = new GeneticAlgorithm<number[]>(fitness, { ...config, initializationOperator: new SeededInit() });
        const best1 = await ga1.evolve();
        const fit1 = fitness(best1 as number[]);

        const ga2 = new GeneticAlgorithm<number[]>(fitness, { ...config, initializationOperator: new SeededInit() });
        const best2 = await ga2.evolve();
        const fit2 = fitness(best2 as number[]);

        expect(fit1).toEqual(fit2);
    });
});
