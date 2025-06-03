import { LocalSearch, ObjectiveFunction, NeighborhoodFunction } from '../../src/search/localSearch';

describe('LocalSearch - Knapsack Problem', () => {
    it('should solve a simple 0/1 knapsack problem', async () => {
        // Define items with value and weight
        const items = [
            { value: 6, weight: 2 },
            { value: 10, weight: 2 },
            { value: 12, weight: 3 },
            { value: 7, weight: 1 },
            { value: 3, weight: 2 }
        ];
        const maxWeight = 5;
        const n = items.length;

        // Objective: maximize total value, but return 0 if overweight
        const objectiveFunction: ObjectiveFunction<number[]> = (solution: number[]) => {
            let totalValue = 0;
            let totalWeight = 0;
            for (let i = 0; i < n; i++) {
                if (solution[i] === 1) {
                    totalValue += items[i].value;
                    totalWeight += items[i].weight;
                }
            }
            return totalWeight <= maxWeight ? totalValue : 0;
        };

        // Neighborhood: flip each bit (0 <-> 1)
        const neighborhoodFunction: NeighborhoodFunction<number[]> = (solution: number[]) => {
            const neighbors: number[][] = [];
            for (let i = 0; i < n; i++) {
                const neighbor = [...solution];
                neighbor[i] = neighbor[i] === 0 ? 1 : 0;
                neighbors.push(neighbor);
            }
            return neighbors;
        };

        const localSearch = new LocalSearch<number[]>();
        const initialSolution = Array(n).fill(0); // Start with all zeros
        const result = await localSearch.search(initialSolution, objectiveFunction, neighborhoodFunction, {
            randomRestarts: 20,
            randomInitializer: () => Array.from({ length: n }, () => Math.round(Math.random())),
            maxIterations: 1000,
            maximize: true
        });

        // The optimal solution is [1, 1, 0, 1, 0] (value=23, weight=5)
        expect(result.fitness).toBe(23);
        expect(result.solution).toEqual([1, 1, 0, 1, 0]);
    });
});
