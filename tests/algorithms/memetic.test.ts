import { Individual, memeticAlgorithm } from '../../src/algorithms/memetic';

describe('memeticAlgorithm', () => {
    it('should return a solution for a simple problem', () => {
        // Example problem: maximize f(x) = x^2 for x in [0, 10]
        const fitness = (x: Individual) => {
            return x.genome * x.genome;
        };

        const createIndividual = (): Individual => {
            return {
                genome: Math.floor(Math.random() * 11),
                fitness: 0,
            }
        }
        const mutate = (individual: Individual) => {
            return {
                genome: Math.max(0, Math.min(10, individual.genome + (Math.random() < 0.5 ? 1 : -1))),
                fitness: 0,
            };
        };
        const crossover = (a: Individual, b: Individual) => {
            return {
                genome: Math.round((a.genome + b.genome) / 2),
                fitness: 0,
            }
        };

        const result = memeticAlgorithm({
            populationSize: 10,
            generations: 20,
            crossoverRate: 0.7,
            mutationRate: 0.1,
            localSearchRate: 0.1,
            initialize: createIndividual,
            evaluate: fitness,
            select: (population: Individual[]) => {
                const sorted = population.sort((a, b) => b.fitness - a.fitness);
                return [sorted[0], sorted[1]]; // Select top 2 individuals
            },
            mutate,
            crossover,
            localSearch: (x: Individual) => x, // No-op local search for simplicity
        });

        expect(result.genome).toBeGreaterThanOrEqual(0);
        expect(result.genome).toBeLessThanOrEqual(10);
        // The best solution should be close to 10 (since 10^2 = 100 is max)
        expect(result.fitness).toBeGreaterThanOrEqual(8);
    });

});