import { MoveSelectionOperator } from './MoveSelectionOperator';
import { NeighborhoodFunction, ObjectiveFunction, LocalSearchOptions } from '../types';

export const NeighborhoodOperator = async ({
    solution,
    fitness,
    neighborhoodFunction,
    objectiveFunction,
    options,
    iterations = 0
}: {
    solution: any;
    fitness: number;
    neighborhoodFunction: NeighborhoodFunction<any>;
    objectiveFunction: ObjectiveFunction<any>;
    options: LocalSearchOptions<any>;
    iterations?: number;
}) => {
    let neighbors;
    if (options.dynamicNeighborhoodFunction) {
        neighbors = options.dynamicNeighborhoodFunction(solution);
    } else if (neighborhoodFunction) {
        neighbors = neighborhoodFunction(solution);
    } else {
        throw new Error('No neighborhood function provided. Please specify either neighborhoodFunction or dynamicNeighborhoodFunction.');
    }
    return await MoveSelectionOperator({
        neighbors,
        currentSolution: solution,
        currentFitness: fitness,
        objectiveFunction,
        options,
        iterations
    });
};
