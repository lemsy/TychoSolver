import { LocalSearch } from '../../src/search/localSearch';
import { describe, it, expect } from 'vitest';
import { ObjectiveFunction, NeighborhoodFunction } from '../../src/search/types';

describe('LocalSearch - Dynamic Neighborhood', () => {
    it('runs for maxIterations with dynamic neighborhood even if no improvement', async () => {
        // Objective: maximize x, but neighborhood always returns the same value
        const objective: ObjectiveFunction<number> = (x) => x;

        // Dynamic neighborhood: always returns only the current solution
        const dynamicNeighborhood: NeighborhoodFunction<number> = (x) => [x];

        const search = new LocalSearch<number>();
        const maxIterations = 7;

        const result = await search.search(0, objective, null, {
            maxIterations,
            maximize: true,
            dynamicNeighborhoodFunction: dynamicNeighborhood,
        });

        expect(result.solution).toBe(0);
        expect(result.iterations).toBe(maxIterations);
    });

    it('solves a small TSP with a closure-based dynamic neighborhood cycling cities', async () => {
        const distances = [
            [0, 1, 2, 3],
            [1, 0, 4, 5],
            [2, 4, 0, 6],
            [3, 5, 6, 0],
        ];

        const objective: ObjectiveFunction<number[]> = (tour) => {
            let sum = 0;

            for (let i = 0; i < tour.length; i++) {
                const from = tour[i]!;
                const to = tour[(i + 1) % tour.length]!;
                sum += distances[from]![to]!;
            }

            return -sum;
        };

        let cityIdx = 0;

        const dynamicNeighborhood: NeighborhoodFunction<number[]> = (tour) => {
            const neighbors: number[][] = [];

            for (let j = 0; j < tour.length; j++) {
                if (j !== cityIdx) {
                    const neighbor = tour.slice();

                    const tmp = neighbor[cityIdx]!;
                    neighbor[cityIdx] = neighbor[j]!;
                    neighbor[j] = tmp;

                    neighbors.push(neighbor);
                }
            }

            cityIdx = (cityIdx + 1) % tour.length;
            return neighbors;
        };

        const initial = [0, 1, 2, 3];

        const search = new LocalSearch<number[]>();

        const result = await search.search(initial, objective, null, {
            maxIterations: 100,
            maximize: true,
            dynamicNeighborhoodFunction: dynamicNeighborhood,
        });

        expect(result.fitness).toBe(-14);
    });

    it('uses dynamic neighborhood when provided (1D hill climbing)', async () => {
        const objective: ObjectiveFunction<number> = (x) => x;

        const dynamicNeighborhood: NeighborhoodFunction<number> = (x) =>
            x < 5 ? [x + 2, x - 2] : [x + 1, x - 1];

        const search = new LocalSearch<number>();

        const result = await search.search(0, objective, null, {
            maxIterations: 20,
            maximize: true,
            dynamicNeighborhoodFunction: dynamicNeighborhood,
        });

        expect(result.solution).toBeGreaterThanOrEqual(10);
    });

    it('falls back to static neighborhood if dynamic is not provided', async () => {
        const objective: ObjectiveFunction<number> = (x) => -Math.abs(x - 3);

        const staticNeighborhood: NeighborhoodFunction<number> = (x) => [
            x - 1,
            x + 1,
        ];

        const search = new LocalSearch<number>();

        const result = await search.search(0, objective, staticNeighborhood, {
            maxIterations: 10,
            maximize: true,
        });

        expect(result.solution).toBe(3);
    });

    it('prefers dynamic neighborhood over static if both are provided', async () => {
        const objective: ObjectiveFunction<number> = (x) => x;

        const staticNeighborhood: NeighborhoodFunction<number> = () => [1];
        const dynamicNeighborhood: NeighborhoodFunction<number> = () => [100];

        const search = new LocalSearch<number>();

        const result = await search.search(0, objective, staticNeighborhood, {
            maxIterations: 5,
            maximize: true,
            dynamicNeighborhoodFunction: dynamicNeighborhood,
        });

        expect(result.solution).toBe(100);
    });
});