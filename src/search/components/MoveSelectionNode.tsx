/** @jsx createNode */
import { createNode } from './jsxFactory';
import { AcceptanceNode } from './AcceptanceNode';
import { ObjectiveFunction, LocalSearchOptions } from '../localSearch';

export const MoveSelectionNode = async ({ neighbors, currentSolution, currentFitness, objectiveFunction, options }: {
  neighbors: any[];
  currentSolution: any;
  currentFitness: number;
  objectiveFunction: ObjectiveFunction<any>;
  options: LocalSearchOptions<any>;
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
  return (
    <AcceptanceNode
      candidateSolution={selectedNeighbor}
      candidateFitness={selectedFitness}
      currentSolution={currentSolution}
      currentFitness={currentFitness}
      options={options}
      isTie={isTie}
      isCostImprovement={isCostImprovement}
    />
  );
};
