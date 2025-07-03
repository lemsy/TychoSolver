import { InitializationNode } from './InitializationNode';
import { LocalSearchOptions, ObjectiveFunction, NeighborhoodFunction } from '../types';

export const RandomRestartsNode = async ({
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
    for (let restart = 0; restart < randomRestarts; restart++) {
        const result = await InitializationNode({
            initialSolution: restart === 0 ? initialSolution : (randomInitializer ? randomInitializer() : initialSolution),
            randomInitializer: undefined,
            objectiveFunction,
            neighborhoodFunction,
            options
        });
        if (!bestResult || (options.maximize ? result.fitness > bestResult.fitness : result.fitness < bestResult.fitness)) {
            bestResult = result;
        }
    }
    return bestResult;
};
