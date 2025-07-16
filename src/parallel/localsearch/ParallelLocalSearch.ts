import type { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions, LocalSearchResult } from '../../search/types';

export class ParallelLocalSearch<T> {
    /**
     * Runs parallel local search on a batch of initial solutions.
     * Each search is run asynchronously and results are collected.
     * @param initialSolutions Array of initial solutions
     * @param objectiveFunction Objective function
     * @param neighborhoodFunction Neighborhood function
     * @param options Local search options (applied to all searches)
     */
    public async search(
        initialSolutions: T[],
        objectiveFunction: ObjectiveFunction<T>,
        neighborhoodFunction: NeighborhoodFunction<T>,
        options: LocalSearchOptions<T> = {}
    ): Promise<LocalSearchResult<T>[]> {
        // Import the operator pipeline
        const { ParallelSearchOperator } = await import('./components/ParallelSearchOperator');
        return await ParallelSearchOperator({
            initialSolutions,
            objectiveFunction,
            neighborhoodFunction,
            options
        });
    }
}
