import { EvaluationOperator } from '../../core/operators/EvaluationOperator';
import { TerminationOperator as ITerminationOperator } from '../../core/operators/TerminationOperator';
import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions, LocalSearchResult } from '../types';


import { SequentialOperator } from '../../core/pipeline/SequentialOperator';
import { Step as PipelineStep } from '../../core/pipeline/Step';

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
    neighborhoodFunction?: NeighborhoodFunction<any> | null;
    options: LocalSearchOptions<any>;
    iterations?: number;
    evaluationOperator: EvaluationOperator<any>;
    neighborhoodOperator: (args: any) => Promise<any>;
    terminationOperator: ITerminationOperator<any>;
}): Promise<LocalSearchResult<any>> => {
    // Step 1: Evaluation
    const evaluationStep: PipelineStep<any> = {
        apply: async (solution: any) => await evaluationOperator.evaluate(solution)
    };

    // Step 2: Neighborhood move
    const neighborhoodStep: PipelineStep<{ solution: any; fitness: number }> = {
        apply: async ({ solution, fitness }) => await neighborhoodOperator({
            solution,
            fitness,
            neighborhoodFunction,
            objectiveFunction,
            options,
            iterations
        })
    };

    // Compose pipeline
    const pipeline = new SequentialOperator<any>([
        {
            apply: async (input: { solution: any; fitness?: number }) => {
                const fitness = input.fitness !== undefined ? input.fitness : await evaluationStep.apply(input.solution);
                return { solution: input.solution, fitness };
            }
        },
        neighborhoodStep
    ]);

    let state = { solution: currentSolution, fitness: currentFitness };
    const useDynamic = !!options.dynamicNeighborhoodFunction;
    const maxIterations = options.maxIterations ?? 1000;
    while (true) {
        const next = await pipeline.apply(state);
        const terminatedAfterMove = terminationOperator.shouldTerminate({
            solution: next.solution,
            fitness: next.fitness,
            options,
            iterations
        });
        if (!next || terminatedAfterMove || (!useDynamic && next.solution === state.solution)) {
            return {
                solution: next ? next.solution : state.solution,
                fitness: next ? next.fitness : state.fitness,
                iterations
            };
        }
        state = { solution: next.solution, fitness: next.fitness };
        iterations++;
        if (useDynamic && iterations >= maxIterations) {
            return {
                solution: state.solution,
                fitness: state.fitness,
                iterations
            };
        }
    }
};
