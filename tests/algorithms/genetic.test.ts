/// <reference types="jest" />
import { GeneticAlgorithm } from '../../src/algorithms/genetic';
import { MutationOperatorImpl } from '../../src/algorithms/genetic/components/MutationOperator';

describe('Genetic Algorithm', () => {
  it('should initialize correctly', () => {
    const initialPopulation = [1, 2, 3, 4, 5];
    const fitnessFunction = (x: number) => x; // Identity function as fitness
    const config = {
      populationSize: 5,
      maxGenerations: 10,
      mutationRate: 0.1,
      crossoverRate: 0.7,
      initializationOperator: { initialize: () => initialPopulation }
    };
    const ga = new GeneticAlgorithm(fitnessFunction, config);
    expect(ga.getPopulation()).toEqual(initialPopulation);
    expect(ga.getGeneration()).toBe(0);
    expect(ga.getBestFitness()).toBe(5);
    expect(ga.getBestSolution()).toBe(5);
  });
});

describe('Genetic Algorithm edge cases', () => {
  it('should throw if initialization operator produces empty population', () => {
    const fitnessFunction = (x: number) => x;
    const config = {
      populationSize: 0,
      maxGenerations: 1,
      mutationRate: 0.1,
      crossoverRate: 0.7,
      initializationOperator: { initialize: () => [] }
    };
    expect(() => new GeneticAlgorithm(fitnessFunction, config)).toThrow();
  });

  it('should not evolve if generations is zero', async () => {
    const initialPopulation = [1, 2, 3];
    const fitnessFunction = (x: number) => x;
    const config = {
      populationSize: 3,
      maxGenerations: 0,
      mutationRate: 0.1,
      crossoverRate: 0.7,
      initializationOperator: { initialize: () => initialPopulation }
    };
    const ga = new GeneticAlgorithm(fitnessFunction, config);
    const best = await ga.evolve(0);
    expect(best).toBeDefined();
    expect(ga.getGeneration()).toBe(0);
  });
});

describe('Genetic Algorithm OneMax problem', () => {
  it('should solve the OneMax problem', async () => {
    // OneMax: maximize the number of 1s in a bitstring
    const bitLength = 10;
    const initialPopulation = Array.from({ length: 10 }, () =>
      Array.from({ length: bitLength }, () => Math.random() < 0.5 ? 0 : 1)
    );
    const fitnessFunction = (individual: number[]) => individual.reduce((a, b) => a + b, 0);
    const mutationOperator = new MutationOperatorImpl<number[]>(
      (gene) => gene === 0 ? 1 : 0,
      0.2 // mutationRate
    );
    const config = {
      populationSize: 10,
      maxGenerations: 50,
      mutationRate: 0.2,
      crossoverRate: 0.7,
      initializationOperator: { initialize: () => initialPopulation },
      mutationOperator
    };
    const ga = new GeneticAlgorithm(fitnessFunction, config);
    const best = await ga.evolve();
    // The best solution should be all 1s or very close
    expect(fitnessFunction(best)).toBeGreaterThanOrEqual(bitLength - 2);
  });
});

describe('Genetic Algorithm Deceptive Trap problem', () => {
  it('should solve the Deceptive Trap problem (k=5)', async () => {
    // Deceptive Trap function for k=5
    function deceptiveTrapBlock(block: number[]): number {
      const k = block.length;
      const u = block.reduce((sum, bit) => sum + bit, 0);
      return u === k ? k : k - 1 - u;
    }
    const k = 5;
    const n = 20; // total length (multiple of k)
    const fitnessFunction = (arr: number[]) => {
      let score = 0;
      for (let i = 0; i < arr.length; i += k) {
        score += deceptiveTrapBlock(arr.slice(i, i + k));
      }
      return score;
    };
    const initialPopulation = Array.from({ length: 10 }, () =>
      Array.from({ length: n }, () => Math.random() < 0.5 ? 0 : 1)
    );
    const mutationOperator = new MutationOperatorImpl<number[]>(
      (gene) => gene === 0 ? 1 : 0,
      0.2 // mutationRate
    );
    const config = {
      populationSize: 10,
      maxGenerations: 100,
      mutationRate: 0.2,
      crossoverRate: 0.7,
      initializationOperator: { initialize: () => initialPopulation },
      mutationOperator
    };
    const ga = new GeneticAlgorithm(fitnessFunction, config);
    const best = await ga.evolve();
    // The global optimum is all ones (score = n)
    // Accept any solution with fitness between deceptive and global optimum
    const deceptiveFitness = (k - 1) * n / k;
    expect(fitnessFunction(best)).toBeGreaterThanOrEqual(deceptiveFitness);
    expect(fitnessFunction(best)).toBeLessThanOrEqual(n);
  });
});
