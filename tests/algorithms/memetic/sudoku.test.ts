import { MemeticAlgorithm, Individual } from '../../../src/algorithms/memetic';
import { GAEvaluationOperator } from '../../../src/algorithms/genetic/components/EvaluationOperator';
import { SelectionOperatorImpl } from '../../../src/algorithms/genetic/components/SelectionOperator';
import { CrossoverOperatorImpl } from '../../../src/algorithms/genetic/components/CrossoverOperator';
import { MutationOperatorImpl } from '../../../src/algorithms/genetic/components/MutationOperator';
import { MemeticInitializationOperator } from '../../../src/algorithms/memetic/components/MemeticInitializationOperator';

describe('MemeticAlgorithm - Sudoku Problem', () => {
    it('should improve a partially filled Sudoku grid', async () => {
        // 4x4 Sudoku for simplicity
        // 0 means empty
        const initialGrid = [
            [1, 0, 0, 4],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [3, 0, 0, 2]
        ];
        const SIZE = 4;
        const SUBGRID = 2;
        type SudokuGenome = number[][];

        // Helper to deep copy a grid
        const copyGrid = (grid: SudokuGenome): SudokuGenome => grid.map(row => [...row]);

        // Individual factory: fill empty cells randomly (respecting 1-4)
        const sudokuIndividualFactory = (): SudokuGenome => {
            const grid = copyGrid(initialGrid);
            for (let i = 0; i < SIZE; i++) {
                for (let j = 0; j < SIZE; j++) {
                    if (grid[i][j] === 0) {
                        grid[i][j] = Math.floor(Math.random() * SIZE) + 1;
                    }
                }
            }
            return grid;
        };

        // Fitness: count number of non-conflicting cells (max = SIZE*SIZE*3)
        const sudokuFitness = (grid: SudokuGenome): number => {
            let score = 0;
            // Rows
            for (let i = 0; i < SIZE; i++) {
                const seen = new Set();
                for (let j = 0; j < SIZE; j++) seen.add(grid[i][j]);
                score += seen.size;
            }
            // Columns
            for (let j = 0; j < SIZE; j++) {
                const seen = new Set();
                for (let i = 0; i < SIZE; i++) seen.add(grid[i][j]);
                score += seen.size;
            }
            // Subgrids
            for (let bi = 0; bi < SIZE; bi += SUBGRID) {
                for (let bj = 0; bj < SIZE; bj += SUBGRID) {
                    const seen = new Set();
                    for (let i = 0; i < SUBGRID; i++) {
                        for (let j = 0; j < SUBGRID; j++) {
                            seen.add(grid[bi + i][bj + j]);
                        }
                    }
                    score += seen.size;
                }
            }
            return score;
        };

        // Neighborhood: change one cell (not a clue) to a random value
        const sudokuNeighborhood = (grid: SudokuGenome): SudokuGenome[] => {
            const neighbors: SudokuGenome[] = [];
            for (let i = 0; i < SIZE; i++) {
                for (let j = 0; j < SIZE; j++) {
                    if (initialGrid[i][j] === 0) {
                        for (let v = 1; v <= SIZE; v++) {
                            if (grid[i][j] !== v) {
                                const neighbor = copyGrid(grid);
                                neighbor[i][j] = v;
                                neighbors.push(neighbor);
                            }
                        }
                    }
                }
            }
            return neighbors;
        };

        const initializationOperator = new MemeticInitializationOperator<SudokuGenome>(sudokuIndividualFactory);
        const evaluationOperator = new GAEvaluationOperator<SudokuGenome>(sudokuFitness);
        const selectionOperator = new SelectionOperatorImpl<Individual<SudokuGenome>>();
        const crossoverOperator = new CrossoverOperatorImpl<SudokuGenome>();
        const mutationOperator = new MutationOperatorImpl<SudokuGenome>((row) => row.map(cell => Math.floor(Math.random() * SIZE) + 1));

        const algo = new MemeticAlgorithm<SudokuGenome>({
            populationSize: 40,
            generations: 40,
            crossoverRate: 0.7,
            mutationRate: 0.2,
            localSearchRate: 0.3,
            initializationOperator,
            evaluationOperator,
            selectionOperator,
            crossoverOperator,
            mutationOperator,
            individualFactory: sudokuIndividualFactory,
            objectiveFunction: sudokuFitness,
            neighborhoodFunction: sudokuNeighborhood,
            localSearchOptions: {
                maxIterations: 5,
                maximize: true
            }
        });

        const result = await algo.evolve();
        // The best possible fitness is SIZE*SIZE*3 = 48 (no conflicts)
        expect(sudokuFitness(result.genome)).toBeGreaterThanOrEqual(40); // Accept near-perfect
    });
});
