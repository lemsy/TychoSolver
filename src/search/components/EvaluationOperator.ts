import { NeighborhoodOperator } from './NeighborhoodOperator';
import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions } from '../types';

export const EvaluationOperator = async ({
    solution,
    objectiveFunction,
    neighborhoodFunction,
    options
}: {
    solution: any;
    objectiveFunction: ObjectiveFunction<any>;
    neighborhoodFunction: NeighborhoodFunction<any>;
    options: LocalSearchOptions<any>;
}) => {
    const fitness = await objectiveFunction(solution);
    return NeighborhoodOperator({
        solution,
        fitness,
        neighborhoodFunction,
        objectiveFunction,
        options
    });
};
