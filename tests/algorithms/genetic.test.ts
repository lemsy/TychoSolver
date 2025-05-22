/// <reference types="jest" />
import { GeneticAlgorithm } from '../../src/algorithms/genetic';

describe('Genetic Algorithm', () => {
  it('should initialize correctly', () => {
    const initialPopulation = [1, 2, 3, 4, 5];
    const fitnessFunction = (x: number) => x; // Identity function as fitness
    const config = {
      populationSize: 5,
      maxGenerations: 10,
      mutationRate: 0.1,
      crossoverRate: 0.7
    };
    const ga = new GeneticAlgorithm(initialPopulation, fitnessFunction, config);
    expect(ga.getPopulation()).toEqual(initialPopulation);
    expect(ga.getGeneration()).toBe(0);
    expect(ga.getBestFitness()).toBe(5);
    expect(ga.getBestSolution()).toBe(5);
  });
});

describe('Genetic Algorithm edge cases', () => {
  it('should handle empty population gracefully', () => {
    const fitnessFunction = (x: number) => x;
    const config = {
      populationSize: 0,
      maxGenerations: 1,
      mutationRate: 0.1,
      crossoverRate: 0.7
    };
    // The implementation does not throw, so check for empty population and undefined best
    const ga = new GeneticAlgorithm([], fitnessFunction, config);
    expect(ga.getPopulation().length).toBe(0);
    expect(ga.getBestSolution()).toBeUndefined();
    expect(ga.getBestFitness()).toBeUndefined();
  });

  it('should not evolve if generations is zero', () => {
    const initialPopulation = [1, 2, 3];
    const fitnessFunction = (x: number) => x;
    const config = {
      populationSize: 3,
      maxGenerations: 0,
      mutationRate: 0.1,
      crossoverRate: 0.7
    };
    const ga = new GeneticAlgorithm(initialPopulation, fitnessFunction, config);
    const best = ga.evolve(0);
    expect(best).toBeDefined();
    expect(ga.getGeneration()).toBe(0);
  });
});
