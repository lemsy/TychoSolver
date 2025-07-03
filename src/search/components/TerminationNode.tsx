/** @jsx createNode */
import { createNode } from './jsxFactory';
import { LocalSearchOptions } from '../localSearch';

export const TerminationNode = ({ solution, fitness, options, iterations = 0 }: {
  solution: any;
  fitness: number;
  options: LocalSearchOptions<any>;
  iterations?: number;
}) => {
  const maxIterations = options.maxIterations ?? 1000;
  const fitnessLimit = options.fitnessLimit;
  // Check for termination
  if (iterations >= maxIterations) {
    return { solution, fitness, iterations };
  }
  if (typeof fitnessLimit === 'number') {
    if ((options.maximize && fitness >= fitnessLimit) || (!options.maximize && fitness <= fitnessLimit)) {
      return { solution, fitness, iterations };
    }
  }
  // Continue search (not implemented: would need to pass control back to NeighborhoodNode with incremented iterations)
  return { solution, fitness, iterations };
};
