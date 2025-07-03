import { TerminationNode } from './TerminationNode';
import { LocalSearchOptions } from '../types';

export const AcceptanceNode = async ({
    candidateSolution,
    candidateFitness,
    currentSolution,
    currentFitness,
    options,
    isTie,
    isCostImprovement,
    iterations = 0
}: {
    candidateSolution: any;
    candidateFitness: number;
    currentSolution: any;
    currentFitness: number;
    options: LocalSearchOptions<any>;
    isTie?: boolean;
    isCostImprovement?: boolean;
    iterations?: number;
}) => {
    // Accept improvement or tie with cost improvement
    const accepted = (options.maximize ? candidateFitness > currentFitness : candidateFitness < currentFitness)
        || (isTie && isCostImprovement);
    const nextSolution = accepted ? candidateSolution : currentSolution;
    const nextFitness = accepted ? candidateFitness : currentFitness;
    // Call onClimb if improvement
    if (accepted && options.onClimb) {
        await options.onClimb(nextSolution, nextFitness, iterations);
    }
    // Pass through to TerminationNode
    return TerminationNode({
        solution: nextSolution,
        fitness: nextFitness,
        options,
        iterations
    });
};
