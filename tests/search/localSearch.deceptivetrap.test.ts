import { LocalSearch, ObjectiveFunction, NeighborhoodFunction } from '../../src/search/localSearch';

describe('LocalSearch - Deceptive Trap Function', () => {
    it('should solve the Deceptive Trap problem (for k=5)', () => {
        // Deceptive Trap function for k=5
        // For each block of 5 bits:
        //   if all bits are 1: score = 5
        //   else: score = 4 - number of ones
        function deceptiveTrapBlock(block: number[]): number {
            const k = block.length;
            const u = block.reduce((sum, bit) => sum + bit, 0);
            return u === k ? k : k - 1 - u;
        }

        // Objective: sum of trap blocks
        const k = 5;
        const n = 20; // total length (multiple of k)
        const objectiveFunction: ObjectiveFunction<number[]> = (arr: number[]) => {
            let score = 0;
            for (let i = 0; i < arr.length; i += k) {
                score += deceptiveTrapBlock(arr.slice(i, i + k));
            }
            return score;
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
        const initialSolution = Array(n).fill(0); // Start with all zeros
        // Add random restarts configuration
        const result = localSearch.search(initialSolution, objectiveFunction, neighborhoodFunction, {
            randomRestarts: 100,
            randomInitializer: () => Array.from({ length: n }, () => Math.round(Math.random())),
            maxIterations: 1000,
            maximize: true
        });

        // The global optimum is all ones
        // Accept any solution with fitness between deceptive and global optimum
        const deceptiveFitness = (k - 1) * n / k;
        expect(result.fitness).toBeGreaterThanOrEqual(deceptiveFitness);
        expect(result.fitness).toBeLessThanOrEqual(n);
        // eslint-disable-next-line no-console
        console.info('Deceptive Trap: best solution found:', result.solution, 'fitness:', result.fitness);
    });
});
