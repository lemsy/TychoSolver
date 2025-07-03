/** @jsx createNode */
import { createNode } from './jsxFactory';
import { TerminationNode } from './TerminationNode';
import { LocalSearchOptions } from '../localSearch';

export const AcceptanceNode = async ({ candidateSolution, candidateFitness, currentSolution, currentFitness, options, isTie, isCostImprovement }: {
  candidateSolution: any;
  candidateFitness: number;
  currentSolution: any;
  currentFitness: number;
  options: LocalSearchOptions<any>;
  isTie?: boolean;
  isCostImprovement?: boolean;
}) => {
  // Accept improvement or tie with cost improvement
  const accepted = (options.maximize ? candidateFitness > currentFitness : candidateFitness < currentFitness)
    || (isTie && isCostImprovement);
  const nextSolution = accepted ? candidateSolution : currentSolution;
  const nextFitness = accepted ? candidateFitness : currentFitness;
  // Call onClimb if improvement
  if (accepted && options.onClimb) {
    options.onClimb(nextSolution, nextFitness, 0); // Pass 0 for iteration, can be improved
  }
  return (
    <TerminationNode
      solution={nextSolution}
      fitness={nextFitness}
      options={options}
    />
  );
};
