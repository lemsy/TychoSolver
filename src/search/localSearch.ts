import { RandomRestartsOperator } from './components/RandomRestartsOperator';
import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions, LocalSearchResult } from './types';

export class LocalSearch<T> {
  /**
   * Performs local search to find a local optimum using operator-based operators
   */
  public async search(
    initialSolution: T,
    objectiveFunction: ObjectiveFunction<T>,
    neighborhoodFunction?: NeighborhoodFunction<T> | null,
    options: LocalSearchOptions<T> = {}
  ): Promise<LocalSearchResult<T>> {
    // Ensure maximize defaults to true unless explicitly set to false
    const opts: LocalSearchOptions<T> = { maximize: true, ...options };
    // Compose the search tree using the operator-based operators (function call style)
    return await RandomRestartsOperator({
      initialSolution,
      objectiveFunction,
      neighborhoodFunction: neighborhoodFunction ?? undefined,
      options: opts
    });
  }
}
