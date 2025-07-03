import { EvaluationOperator } from '../../core/operators/EvaluationOperator';
import { TerminationOperator as ITerminationOperator } from '../../core/operators/TerminationOperator';
import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions, LocalSearchResult } from '../types';

export const SearchLoopOperator = async ({
    currentSolution,
    currentFitness,
    objectiveFunction,
    neighborhoodFunction,
    options,
    iterations = 0,
    evaluationOperator,
    neighborhoodOperator,
    terminationOperator
}: {
    currentSolution: any;
    currentFitness: number;
    objectiveFunction: ObjectiveFunction<any>;
    neighborhoodFunction: NeighborhoodFunction<any>;
    options: LocalSearchOptions<any>;
    iterations?: number;
    evaluationOperator: EvaluationOperator<any>;
    neighborhoodOperator: (args: any) => Promise<any>;
    terminationOperator: ITerminationOperator<any>;
}): Promise<LocalSearchResult<any>> => {
    // Evaluate current solution (optional, if needed)
    const fitness = await evaluationOperator.evaluate(currentSolution);
    // Perform one search step
    const next = await neighborhoodOperator({
        solution: currentSolution,
        fitness,
        neighborhoodFunction,
        objectiveFunction,
        options,
        iterations
    });
    // Check for termination after move
    const terminatedAfterMove = terminationOperator.shouldTerminate({
        solution: next.solution,
        fitness: next.fitness,
        options,
        iterations
    });
    if (!next || next.solution === currentSolution || terminatedAfterMove) {
        return {
            solution: next ? next.solution : currentSolution,
            fitness: next ? next.fitness : fitness,
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
        iterations: iterations + 1,
        evaluationOperator,
        neighborhoodOperator,
        terminationOperator
    });
};
