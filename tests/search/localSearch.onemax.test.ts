import { LocalSearch } from '../../src/search/localSearch';
import { ObjectiveFunction, NeighborhoodFunction } from '../../src/search/types';

describe('LocalSearch - OneMax Problem', () => {
    it('should solve the OneMax problem (maximize number of ones in a binary string)', async () => {
        // OneMax objective: maximize the number of ones in the array
        const objectiveFunction: ObjectiveFunction<number[]> = (arr: number[]) => {
            return arr.reduce((sum, val) => sum + val, 0);
        };

        // Neighborhood: flip each bit (0 <-> 1)
        const neighborhoodFunction: NeighborhoodFunction<number[]> = (arr: number[]) => {
            const neighbors: number[][] = [];
            for (let i = 0; i < arr.length; i++) {
                const neighbor = [...arr];
                neighbor[i] = neighbor[i] === 0 ? 1 : 0;
                neighbors.push(neighbor);
            }
            return neighbors;
        };

        const localSearch = new LocalSearch<number[]>();
        const n = 10;
        const initialSolution = Array(n).fill(0); // Start with all zeros
        const result = await localSearch.search(initialSolution, objectiveFunction, neighborhoodFunction);

        // The optimal solution is all ones
        expect(result.solution).toEqual(Array(n).fill(1));
        expect(result.fitness).toBe(n);
    });
});
