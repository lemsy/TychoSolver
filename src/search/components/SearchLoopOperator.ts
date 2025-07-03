import { NeighborhoodOperator } from './NeighborhoodOperator';
import { TerminationOperator } from './TerminationOperator';
import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions, LocalSearchResult } from '../types';

export const SearchLoopOperator = async ({
    currentSolution,
    currentFitness,
    objectiveFunction,
    neighborhoodFunction,
    options,
    iterations = 0
}: {
    currentSolution: any;
    currentFitness: number;
    objectiveFunction: ObjectiveFunction<any>;
    neighborhoodFunction: NeighborhoodFunction<any>;
    options: LocalSearchOptions<any>;
    iterations?: number;
}): Promise<LocalSearchResult<any>> => {
    // Check for termination
    const termResult = TerminationOperator({
        solution: currentSolution,
        fitness: currentFitness,
        options,
        iterations
    });
    if (termResult.terminated) {
        return {
            solution: termResult.solution,
            fitness: termResult.fitness,
            iterations: termResult.iterations
        };
    }
    // Perform one search step
    const next = await NeighborhoodOperator({
        solution: currentSolution,
        fitness: currentFitness,
        neighborhoodFunction,
        objectiveFunction,
        options,
        iterations
    });
    // If no improvement, return current
    if (!next || next.solution === currentSolution) {
        return {
            solution: currentSolution,
            fitness: currentFitness,
            iterations
        };
    }
    // Continue search with incremented iterations
    return await SearchLoopOperator({
        currentSolution: next.solution,
        currentFitness: next.fitness,
        objectiveFunction,
        neighborhoodFunction,
        options,
        iterations: iterations + 1
    });
};
