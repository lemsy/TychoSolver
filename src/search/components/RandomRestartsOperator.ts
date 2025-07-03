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
    neighborhoodFunction: NeighborhoodFunction<any>;
    options: LocalSearchOptions<any>;
}) => {
    const { randomRestarts = 1, randomInitializer } = options;
    let bestResult: any = null;
    // Instantiate modular operators
    const evaluationOperator = new LSEvaluationOperator(objectiveFunction);
    const neighborhoodOperator = NeighborhoodOperator;
    const terminationOperator = new LSTerminationOperator();
    for (let restart = 0; restart < randomRestarts; restart++) {
        const result = await new LSInitializationOperator().initialize({
            initialSolution: restart === 0 ? initialSolution : (randomInitializer ? randomInitializer() : initialSolution),
            randomInitializer: undefined,
            objectiveFunction,
            neighborhoodFunction,
            options,
            evaluationOperator,
            neighborhoodOperator,
            terminationOperator
        });
        if (!bestResult || (options.maximize ? result.fitness > bestResult.fitness : result.fitness < bestResult.fitness)) {
            bestResult = result;
        }
    }
    return bestResult;
};
