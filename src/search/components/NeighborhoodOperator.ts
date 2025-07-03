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
    const neighbors = options.dynamicNeighborhoodFunction
        ? options.dynamicNeighborhoodFunction(solution)
        : neighborhoodFunction(solution);
    return await MoveSelectionOperator({
        neighbors,
        currentSolution: solution,
        currentFitness: fitness,
        objectiveFunction,
        options,
        iterations
    });
};
