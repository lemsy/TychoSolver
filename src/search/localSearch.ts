import { RandomRestartsNode } from './components/RandomRestartsNode';
import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions, LocalSearchResult } from './types';

export class LocalSearch<T> {
  /**
   * Performs local search to find a local optimum using node-based operators
   */
  public async search(
    initialSolution: T,
    objectiveFunction: ObjectiveFunction<T>,
    neighborhoodFunction: NeighborhoodFunction<T>,
    options: LocalSearchOptions<T> = {}
  ): Promise<LocalSearchResult<T>> {
    // Ensure maximize defaults to true unless explicitly set to false
    const opts: LocalSearchOptions<T> = { maximize: true, ...options };
    // Compose the search tree using the node-based operators (function call style)
    return await RandomRestartsNode({
      initialSolution,
      objectiveFunction,
      neighborhoodFunction,
      options: opts
    });
  }
}
