import { describe, it, expect } from 'vitest';
import { GeneticAlgorithm } from '../../../src/algorithms/genetic';

describe('Genetic Algorithm TSP problem', () => {
    it('should find a short tour for a small TSP', async () => {
        // 4 cities in a square
        const cities = [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: 0 }
        ] as const;

        const numCities = cities.length;

        // Distance function
        const dist = (a: number, b: number): number => {
            const cityA = cities[a]!;
            const cityB = cities[b]!;

            const dx = cityA.x - cityB.x;
            const dy = cityA.y - cityB.y;

            return Math.sqrt(dx * dx + dy * dy);
        };

        // Fitness: negative total tour length (maximize)
        const fitnessFunction = (tour: number[]): number => {
            let length = 0;

            for (let i = 0; i < tour.length; i++) {
                const from = tour[i]!;
                const to = tour[(i + 1) % tour.length]!;

                length += dist(from, to);
            }

            return -length;
        };

        // Random permutation generator
        function randomTour(): number[] {
            const arr: number[] = Array.from({ length: numCities }, (_, i) => i);

            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));

                const tmp = arr[i]!;
                arr[i] = arr[j]!;
                arr[j] = tmp;
            }

            return arr;
        }

        // Swap mutation for permutations
        const mutationOperator = {
            mutate: (tour: number[]): number[] => {
                const a = Math.floor(Math.random() * tour.length);
                let b = Math.floor(Math.random() * tour.length);

                while (a === b) {
                    b = Math.floor(Math.random() * tour.length);
                }

                const newTour = [...tour];

                const tmp = newTour[a]!;
                newTour[a] = newTour[b]!;
                newTour[b] = tmp;

                return newTour;
            }
        };

        // Order 1 crossover (OX1) for permutations
        const crossoverOperator = {
            crossover: (p1: number[], p2: number[]): [number[], number[]] => {
                const size = p1.length;
                const start = Math.floor(Math.random() * size);
                const end = start + Math.floor(Math.random() * (size - start));

                const child: number[] = Array(size).fill(-1);

                for (let i = start; i <= end; i++) {
                    child[i] = p1[i]!;
                }

                let insertIndex = 0;

                for (let i = 0; i < size; i++) {
                    const gene = p2[i]!;

                    if (!child.includes(gene)) {
                        while (child[insertIndex] !== -1) {
                            insertIndex++;
                        }

                        child[insertIndex] = gene;
                    }
                }

                return [child, [...child]];
            }
        };

        // Initial population
        const initialPopulation: number[][] = Array.from(
            { length: 10 },
            () => randomTour()
        );

        const config = {
            populationSize: 30,
            maxGenerations: 1000,
            mutationRate: 0.3,
            crossoverRate: 0.8,
            initializationOperator: {
                initialize: () => initialPopulation
            },
            mutationOperator,
            crossoverOperator
        };

        const ga = new GeneticAlgorithm(fitnessFunction, config);

        const best = await ga.evolve();

        const bestLength = -fitnessFunction(best);

        expect(bestLength).toBeLessThanOrEqual(4.83);
        expect(new Set(best).size).toBe(numCities);
    });
});