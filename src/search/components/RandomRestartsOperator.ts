import { LSInitializationOperator } from './InitializationOperator';
import { LSEvaluationOperator } from './EvaluationOperator';
import { LSTerminationOperator } from './TerminationOperator';
import { LocalSearchOptions, ObjectiveFunction, NeighborhoodFunction } from '../types';
import { NeighborhoodOperator } from './NeighborhoodOperator';

export const RandomRestartsOperator = async ({
    initialSolution,
    objectiveFunction,
    neighborhoodFunction,
    options
}: {
    initialSolution: any;
    objectiveFunction: ObjectiveFunction<any>;
    neighborhoodFunction?: NeighborhoodFunction<any> | null;
    options: LocalSearchOptions<any>;
}) => {
    const { randomRestarts = 1, randomInitializer } = options;

    let bestResult: any = null;

    // Instantiate modular operators
    const evaluationOperator = new LSEvaluationOperator(objectiveFunction);
    const neighborhoodOperator = NeighborhoodOperator;
    const terminationOperator = new LSTerminationOperator();

    for (let restart = 0; restart < randomRestarts; restart++) {
        const args: Parameters<LSInitializationOperator['initialize']>[0] = {
            initialSolution:
                restart === 0
                    ? initialSolution
                    : (randomInitializer ? randomInitializer() : initialSolution),
            objectiveFunction,
            options,
            evaluationOperator,
            neighborhoodOperator,
            terminationOperator
        };

        if (randomInitializer !== undefined) {
            args.randomInitializer = randomInitializer;
        }

        if (neighborhoodFunction !== undefined) {
            args.neighborhoodFunction = neighborhoodFunction;
        }

        const result = await new LSInitializationOperator().initialize(args);

        if (
            !bestResult ||
            (options.maximize
                ? result.fitness > bestResult.fitness
                : result.fitness < bestResult.fitness)
        ) {
            bestResult = result;
        }
    }

    return bestResult;
};