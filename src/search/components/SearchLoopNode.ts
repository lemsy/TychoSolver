import { NeighborhoodNode } from './NeighborhoodNode';
import { TerminationNode } from './TerminationNode';
import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions, LocalSearchResult } from '../types';

export const SearchLoopNode = async ({
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
    const termResult = TerminationNode({
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
    const next = await NeighborhoodNode({
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
    return await SearchLoopNode({
        currentSolution: next.solution,
        currentFitness: next.fitness,
        objectiveFunction,
        neighborhoodFunction,
        options,
        iterations: iterations + 1
    });
};
