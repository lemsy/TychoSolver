import { LocalSearch, ObjectiveFunction, NeighborhoodFunction } from '../../src/search/localSearch';

describe('LocalSearch - Traveling Salesman Problem (TSP) with onClimb notification', () => {
    // Simple TSP instance: 4 cities in a square
    // Distance matrix (symmetric)
    const distances = [
        [0, 1, 2, 1],
        [1, 0, 1, 2],
        [2, 1, 0, 1],
        [1, 2, 1, 0],
    ];
    const numCities = distances.length;

    // A solution is a permutation of city indices
    type Tour = number[];

    // Objective: minimize total tour length (return to start)
    const objective: ObjectiveFunction<Tour> = (tour) => {
        let length = 0;
        for (let i = 0; i < tour.length; i++) {
            const from = tour[i];
            const to = tour[(i + 1) % tour.length];
            length += distances[from][to];
        }
        // Negate for maximization (since LocalSearch defaults to maximize)
        return -length;
    };

    // Neighborhood: all tours by swapping two cities
    const neighborhood: NeighborhoodFunction<Tour> = (tour) => {
        const neighbors: Tour[] = [];
        for (let i = 0; i < tour.length - 1; i++) {
            for (let j = i + 1; j < tour.length; j++) {
                const neighbor = tour.slice();
                [neighbor[i], neighbor[j]] = [neighbor[j], neighbor[i]];
                neighbors.push(neighbor);
            }
        }
        return neighbors;
    };

    // Random initializer
    function randomTour(): Tour {
        const arr = Array.from({ length: numCities }, (_, i) => i);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    it('finds a short tour and calls onClimb on every improvement', (done) => {
        // Use a non-optimal initial tour to ensure at least one climb
        const initial = [2, 0, 3, 1];
        const climbs: { tour: Tour; fitness: number; iteration: number }[] = [];
        const onClimb = async (solution: Tour, fitness: number, iteration: number) => {
            climbs.push({ tour: solution.slice(), fitness, iteration });
        };

        const search = new LocalSearch<Tour>();
        const result = search.search(
            initial,
            objective,
            neighborhood,
            {
                maxIterations: 100,
                maximize: true, // Because we negate the length
                randomRestarts: 1,
                randomInitializer: randomTour,
                onClimb,
            }
        );

        // Synchronous expects (immediate results)
        expect(-result.fitness).toBe(4);
        expect(result.solution.length).toBe(numCities);

        // Asynchronous expects (wait for climbs to be populated)
        setTimeout(() => {
            expect(climbs.length).toBeGreaterThan(0);
            expect(climbs[climbs.length - 1].fitness).toBe(result.fitness);
            done();
        }, 20);
    });
});
