import { GeneticAlgorithm, geneticAlgorithmUtils } from '../src';

describe('GeneticAlgorithm', () => {
  // Simple maximization problem: find x that maximizes f(x) = x^2
  const createSimpleGA = () => {
    return new GeneticAlgorithm({
      populationSize: 20,
      geneLength: 8,
      geneGenerator: geneticAlgorithmUtils.binaryGeneGenerator,
      fitnessFunction: (genes) => {
        const value = geneticAlgorithmUtils.binaryToDecimal(genes);
        return value * value; // x^2
      },
      crossoverRate: 0.8,
      mutationRate: 0.1,
      elitismCount: 2,
      maxGenerations: 50
    });
  };

  describe('initialization', () => {
    it('should create a population with the specified size', () => {
      const ga = createSimpleGA();
      expect(ga.getPopulation().length).toBe(20);
    });

    it('should calculate fitness for initial population', () => {
      const ga = createSimpleGA();
      const population = ga.getPopulation();
      for (const individual of population) {
        expect(individual.fitness).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('evolution', () => {
    it('should increase generation counter after evolve', () => {
      const ga = createSimpleGA();
      expect(ga.getGeneration()).toBe(0);
      
      ga.evolve();
      expect(ga.getGeneration()).toBe(1);
      
      ga.evolve();
      expect(ga.getGeneration()).toBe(2);
    });

    it('should maintain population size after evolution', () => {
      const ga = createSimpleGA();
      const initialSize = ga.getPopulation().length;
      
      ga.evolve();
      expect(ga.getPopulation().length).toBe(initialSize);
      
      ga.evolve();
      ga.evolve();
      expect(ga.getPopulation().length).toBe(initialSize);
    });

    it('should preserve the best individual when using elitism', () => {
      // Create GA with high elitism to test preservation
      const ga = new GeneticAlgorithm({
        populationSize: 20,
        geneLength: 8,
        geneGenerator: geneticAlgorithmUtils.binaryGeneGenerator,
        fitnessFunction: (genes) => {
          const value = geneticAlgorithmUtils.binaryToDecimal(genes);
          return value * value;
        },
        crossoverRate: 0.8,
        mutationRate: 0.1,
        elitismCount: 5, // High elitism count for testing
        maxGenerations: 50
      });
      
      const bestBefore = ga.getBestIndividual();
      ga.evolve();
      const bestAfter = ga.getBestIndividual();

      // Either the best should improve or stay the same
      expect(bestAfter.fitness).toBeGreaterThanOrEqual(bestBefore.fitness);
    });
  });

  describe('run method', () => {
    it('should run for specified number of generations', () => {
      const ga = createSimpleGA();
      ga.run({ maxGenerations: 10 });
      expect(ga.getGeneration()).toBe(10);
    });

    it('should stop when target fitness is reached', () => {
      const ga = createSimpleGA();
      
      // Set target fitness that should be reachable before max generations
      ga.run({ 
        maxGenerations: 100,
        targetFitness: 100 // Should be easily achievable in the search space
      });
      
      expect(ga.getGeneration()).toBeLessThan(100);
      expect(ga.getBest()?.fitness).toBeGreaterThanOrEqual(100);
    });

    it('should stop when callback returns true', () => {
      const ga = createSimpleGA();
      let callCount = 0;
      
      ga.run({ 
        maxGenerations: 50,
        onGenerationComplete: () => {
          callCount++;
          return callCount >= 5; // Stop after 5 generations
        }
      });
      
      expect(ga.getGeneration()).toBe(5);
    });
  });

  describe('reset method', () => {
    it('should reset the generation counter', () => {
      const ga = createSimpleGA();
      ga.evolve();
      ga.evolve();
      expect(ga.getGeneration()).toBe(2);
      
      ga.reset();
      expect(ga.getGeneration()).toBe(0);
    });

    it('should regenerate the population', () => {
      const ga = createSimpleGA();
      const initialPopulation = ga.getPopulation();
      ga.reset();
      const newPopulation = ga.getPopulation();
      
      // Check that it's a new population (this check is probabilistic but reliable)
      let allSame = true;
      for (let i = 0; i < initialPopulation.length; i++) {
        if (JSON.stringify(initialPopulation[i].genes) !== JSON.stringify(newPopulation[i].genes)) {
          allSame = false;
          break;
        }
      }
      
      expect(allSame).toBe(false);
    });
  });

  // Remove the problematic code
  // GeneticAlgorithm.prototype['getBestIndividual'] = function() {
  //   return this['getBestIndividual']();
  // };
});
