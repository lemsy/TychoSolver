import { LocalSearch } from '../../src/search/localSearch';
import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions } from '../../src/search/types';

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
        // Should not improve, but should run for maxIterations
        expect(result.solution).toBe(0);
        expect(result.iterations).toBe(maxIterations);
    });
    it('solves a small TSP with a closure-based dynamic neighborhood cycling cities', async () => {
        // TSP: 4 cities, distance matrix
        const distances = [
            [0, 1, 2, 3],
            [1, 0, 4, 5],
            [2, 4, 0, 6],
            [3, 5, 6, 0],
        ];
        // Objective: minimize total tour length (return to start)
        const objective: ObjectiveFunction<number[]> = (tour) => {
            let sum = 0;
            for (let i = 0; i < tour.length; i++) {
                sum += distances[tour[i]][tour[(i + 1) % tour.length]];
            }
            return -sum; // maximize negative length
        };
        // Dynamic neighborhood: closure, only allows swaps involving one city per call
        let cityIdx = 0;
        const dynamicNeighborhood: NeighborhoodFunction<number[]> = (tour) => {
            const neighbors: number[][] = [];
            for (let j = 0; j < tour.length; j++) {
                if (j !== cityIdx) {
                    const neighbor = tour.slice();
                    [neighbor[cityIdx], neighbor[j]] = [neighbor[j], neighbor[cityIdx]];
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
        // The optimal tour is [0,1,2,3] with length 1+4+6+3=14, so -14
        expect(result.fitness).toBe(-14);
    });
    it('uses dynamic neighborhood when provided (1D hill climbing)', async () => {
        // Objective: maximize x, optimal at x=10
        const objective: ObjectiveFunction<number> = (x) => x;
        // Dynamic neighborhood: if x < 5, can jump by 2; else, by 1
        const dynamicNeighborhood: NeighborhoodFunction<number> = (x) =>
            x < 5 ? [x + 2, x - 2] : [x + 1, x - 1];

        const search = new LocalSearch<number>();
        const result = await search.search(0, objective, null, {
            maxIterations: 20,
            maximize: true,
            dynamicNeighborhoodFunction: dynamicNeighborhood,
        });
        // Should reach at least 10 (with dynamic jumps)
        expect(result.solution).toBeGreaterThanOrEqual(10);
    });

    it('falls back to static neighborhood if dynamic is not provided', async () => {
        const objective: ObjectiveFunction<number> = (x) => -Math.abs(x - 3);
        const staticNeighborhood: NeighborhoodFunction<number> = (x) => [x - 1, x + 1];
        const search = new LocalSearch<number>();
        const result = await search.search(0, objective, staticNeighborhood, {
            maxIterations: 10,
            maximize: true,
        });
        // Should find the optimum at x=3
        expect(result.solution).toBe(3);
    });

    it('prefers dynamic neighborhood over static if both are provided', async () => {
        // Dynamic neighborhood always returns [100], static returns [1]
        const objective: ObjectiveFunction<number> = (x) => x;
        const staticNeighborhood: NeighborhoodFunction<number> = () => [1];
        const dynamicNeighborhood: NeighborhoodFunction<number> = () => [100];
        const search = new LocalSearch<number>();
        const result = await search.search(0, objective, staticNeighborhood, {
            maxIterations: 5,
            maximize: true,
            dynamicNeighborhoodFunction: dynamicNeighborhood,
        });
        // Should reach 100 due to dynamic neighborhood
        expect(result.solution).toBe(100);
    });
});
