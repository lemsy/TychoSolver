/** @jsx createNode */
import { createNode } from './jsxFactory';
import { EvaluationNode } from './EvaluationNode';
import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions } from '../localSearch';

export const InitializationNode = ({ initialSolution, randomInitializer, objectiveFunction, neighborhoodFunction, options }: {
  initialSolution: any;
  randomInitializer?: () => any;
  objectiveFunction: ObjectiveFunction<any>;
  neighborhoodFunction: NeighborhoodFunction<any>;
  options: LocalSearchOptions<any>;
}) => {
  const solution = randomInitializer ? randomInitializer() : initialSolution;
  return (
    <EvaluationNode
      solution={solution}
      objectiveFunction={objectiveFunction}
      neighborhoodFunction={neighborhoodFunction}
      options={options}
    />
  );
};
