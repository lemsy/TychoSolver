import { LocalSearch, ObjectiveFunction, NeighborhoodFunction, CostFunction } from '../../src/search/localSearch';

describe('LocalSearch - N-Queens with cost function tie-breaking', () => {
    // N-Queens: place N queens on an N×N board so that no two queens threaten each other
    // Solution: array of length N, where value at index i is the row of the queen in column i
    const N = 6;
    type Board = number[];

    // Objective: minimize number of pairs of queens attacking each other (lower is better)
    const objective: ObjectiveFunction<Board> = (board) => {
        let conflicts = 0;
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                if (board[i] === board[j] || Math.abs(board[i] - board[j]) === Math.abs(i - j)) {
                    conflicts++;
                }
            }
        }
        return -conflicts; // maximize (less conflicts is better)
    };

    // Cost function: prefer boards with queens closer to the main diagonal (sum of |row - col|)
    const cost: CostFunction<Board> = (board) => {
        return board.reduce((sum, row, col) => sum + Math.abs(row - col), 0);
    };

    // Neighborhood: move one queen to another row in its column
    const neighborhood: NeighborhoodFunction<Board> = (board) => {
        const neighbors: Board[] = [];
        for (let col = 0; col < N; col++) {
            for (let row = 0; row < N; row++) {
                if (row !== board[col]) {
                    const neighbor = board.slice();
                    neighbor[col] = row;
                    neighbors.push(neighbor);
                }
            }
        }
        return neighbors;
    };

    // Random initializer
    function randomBoard(): Board {
        return Array.from({ length: N }, () => Math.floor(Math.random() * N));
    }

    it('finds a solution and uses cost function to break ties', () => {
        const initial = randomBoard();
        const search = new LocalSearch<Board>();
        const result = search.search(
            initial,
            objective,
            neighborhood,
            {
                maxIterations: 1000,
                maximize: true, // Because we negate the number of conflicts
                randomRestarts: 100,
                randomInitializer: randomBoard,
                costFunction: cost,
                maximizeCost: false, // Prefer lower cost (closer to diagonal)
            }
        );

        expect(result.solution.length).toBe(N);
        // Should have found a solution with no conflicts (fitness 0)
        expect(result.fitness).toBeCloseTo(0);
    });
});
