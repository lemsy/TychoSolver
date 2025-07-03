/** @jsx createNode */
import { createNode } from './jsxFactory';
import { MoveSelectionNode } from './MoveSelectionNode';
import { NeighborhoodFunction, ObjectiveFunction, LocalSearchOptions } from '../localSearch';

export const NeighborhoodNode = ({ solution, fitness, neighborhoodFunction, objectiveFunction, options }: {
  solution: any;
  fitness: number;
  neighborhoodFunction: NeighborhoodFunction<any>;
  objectiveFunction: ObjectiveFunction<any>;
  options: LocalSearchOptions<any>;
}) => {
  const neighbors = options.dynamicNeighborhoodFunction
    ? options.dynamicNeighborhoodFunction(solution)
    : neighborhoodFunction(solution);
  return (
    <MoveSelectionNode
      neighbors={neighbors}
      currentSolution={solution}
      currentFitness={fitness}
      objectiveFunction={objectiveFunction}
      options={options}
    />
  );
};
