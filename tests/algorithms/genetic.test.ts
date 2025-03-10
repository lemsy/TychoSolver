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
