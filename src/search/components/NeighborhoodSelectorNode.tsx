/** @jsx createNode */
import { createNode } from './jsxFactory';
import { NeighborhoodFunction } from '../localSearch';

export const NeighborhoodSelectorNode = ({
  solution,
  neighborhoodFunction,
  dynamicNeighborhoodFunction,
  children
}: {
  solution: any;
  neighborhoodFunction: NeighborhoodFunction<any>;
  dynamicNeighborhoodFunction?: NeighborhoodFunction<any>;
  children: (neighbors: any[]) => any;
}) => {
  const neighbors = dynamicNeighborhoodFunction
    ? dynamicNeighborhoodFunction(solution)
    : neighborhoodFunction(solution);
  return children(neighbors);
};
