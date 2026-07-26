import { describe, it, expect } from 'vitest';
import { LocalSearch } from '../../src/search/localSearch';
import { ParallelLocalSearch } from '../../src/parallel/localsearch/ParallelLocalSearch';
import type { ObjectiveFunction, NeighborhoodFunction } from '../../src/search/types';
import { logger } from '../../src/utils';

describe('ParallelLocalSearch vs LocalSearch - TSP', () => {
    // Even larger TSP instance: 22 cities, random symmetric distances
    const numCities = 22;
    const distances: number[][] = Array.from({ length: numCities }, (_, i) =>
        Array.from({ length: numCities }, (_, j) =>
            i === j ? 0 : Math.floor(Math.abs(Math.sin(i * 13.37 + j * 7.77)) * 100 + Math.abs(i - j) * 3 + 10)
        )
    );
    // Make symmetric
    for (let i = 0; i < numCities; i++) {
        for (let j = i + 1; j < numCities; j++) {
            distances[j][i] = distances[i][j];
        }
    }
    type Tour = number[];

    // Objective: minimize total tour length
    const objective: ObjectiveFunction<Tour> = (tour) => {
        let sum = 0;
        for (let i = 0; i < tour.length; i++) {
            sum += distances[tour[i]][tour[(i + 1) % tour.length]];
        }
        return sum;
    };

    // Neighborhood: swap any two cities
    const neighborhood: NeighborhoodFunction<Tour> = (tour) => {
        const neighbors: Tour[] = [];
        for (let i = 0; i < tour.length; i++) {
            for (let j = i + 1; j < tour.length; j++) {
                const copy = tour.slice();
                [copy[i], copy[j]] = [copy[j], copy[i]];
                neighbors.push(copy);
            }
        }
        return neighbors;
    };

    // Random tour generator
    function randomTour(): Tour {
        const arr = Array.from({ length: numCities }, (_, i) => i);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    it('parallel local search should match sequential results for batch TSP', async () => {
        const batchSize = 10;
        const initialTours = Array.from({ length: batchSize }, randomTour);
        const options = { maxIterations: 200, maximize: false };

        const sequentialResults = [];
        for (const tour of initialTours) {
            const ls = new LocalSearch<Tour>();
            sequentialResults.push(await ls.search(tour, objective, neighborhood, options));
        }

        const pls = new ParallelLocalSearch<Tour>();
        const parallelResults = await pls.search(initialTours, objective, neighborhood, options);

        expect(parallelResults).toHaveLength(batchSize);
        for (let i = 0; i < batchSize; i++) {
            expect(parallelResults[i].fitness).toBe(sequentialResults[i].fitness);
            expect(parallelResults[i].iterations).toBe(sequentialResults[i].iterations);
            expect(parallelResults[i].solution).toEqual(sequentialResults[i].solution);
        }
    });
});
