/** @jsx createNode */
import { createNode } from './jsxFactory';
import { NeighborhoodNode } from './NeighborhoodNode';
import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions } from '../localSearch';

export const EvaluationNode = async ({ solution, objectiveFunction, neighborhoodFunction, options }: {
  solution: any;
  objectiveFunction: ObjectiveFunction<any>;
  neighborhoodFunction: NeighborhoodFunction<any>;
  options: LocalSearchOptions<any>;
}) => {
  const fitness = await objectiveFunction(solution);
  return (
    <NeighborhoodNode
      solution={solution}
      fitness={fitness}
      neighborhoodFunction={neighborhoodFunction}
      objectiveFunction={objectiveFunction}
      options={options}
    />
  );
};
