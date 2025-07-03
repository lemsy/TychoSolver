import { AcceptanceOperator } from './AcceptanceOperator';
import { ObjectiveFunction, LocalSearchOptions } from '../types';

export const MoveSelectionOperator = async ({
    neighbors,
    currentSolution,
    currentFitness,
    objectiveFunction,
    options,
    iterations = 0
}: {
    neighbors: any[];
    currentSolution: any;
    currentFitness: number;
    objectiveFunction: ObjectiveFunction<any>;
    options: LocalSearchOptions<any>;
    iterations?: number;
}) => {
    let selectedNeighbor = currentSolution;
    let selectedFitness = currentFitness;
    let isTie = false;
    let isCostImprovement = false;
    for (const neighbor of neighbors) {
        const neighborFitness = await objectiveFunction(neighbor);
        if ((options.maximize ? neighborFitness > selectedFitness : neighborFitness < selectedFitness)) {
            selectedNeighbor = neighbor;
            selectedFitness = neighborFitness;
            isTie = false;
            isCostImprovement = false;
        } else if (neighborFitness === selectedFitness && options.costFunction) {
            const currentCost = await options.costFunction(currentSolution);
            const neighborCost = await options.costFunction(neighbor);
            isCostImprovement = (options.maximizeCost ?? false)
                ? neighborCost > currentCost
                : neighborCost < currentCost;
            if (isCostImprovement) {
                selectedNeighbor = neighbor;
                selectedFitness = neighborFitness;
                isTie = true;
            }
        }
    }
    return AcceptanceOperator({
        candidateSolution: selectedNeighbor,
        candidateFitness: selectedFitness,
        currentSolution,
        currentFitness,
        options,
        isTie,
        isCostImprovement,
        iterations
    });
};
