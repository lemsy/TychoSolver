// ParallelSearchOperator.ts
// Runs multiple local searches in parallel (async, no threads)
import type { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions, LocalSearchResult } from '../../../search/types';

/**
 * Operator: runs local search on each initial solution asynchronously and collects results.
 */
export async function ParallelSearchOperator<T>({
    initialSolutions,
    objectiveFunction,
    neighborhoodFunction,
    options
}: {
    initialSolutions: T[];
    objectiveFunction: ObjectiveFunction<T>;
    neighborhoodFunction: NeighborhoodFunction<T>;
    options: LocalSearchOptions<T>;
}): Promise<LocalSearchResult<T>[]> {
    // Import the single local search operator (from src/search)
    const { LocalSearch } = await import('../../../search/localSearch');
    // Run all searches in parallel
    return await Promise.all(
        initialSolutions.map(async (init) => {
            const search = new LocalSearch<T>();
            return await search.search(init, objectiveFunction, neighborhoodFunction, options);
        })
    );
}
