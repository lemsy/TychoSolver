import { GeneticAlgorithm, geneticAlgorithmUtils } from '../src';

/**
 * Example: Find the binary string that maximizes f(x) = x^2
 * where x is the decimal value of the binary string
 */

// Create a new genetic algorithm
const ga = new GeneticAlgorithm({
  populationSize: 100,
  geneLength: 16,  // 16-bit binary string
  geneGenerator: geneticAlgorithmUtils.binaryGeneGenerator,
  fitnessFunction: (genes) => {
    const value = geneticAlgorithmUtils.binaryToDecimal(genes);
    return value * value;  // x^2
  },
  crossoverRate: 0.8,
  mutationRate: 0.05,
  elitismCount: 2,
  maxGenerations: 100
});

// Run the algorithm
const bestSolution = ga.run({
  onGenerationComplete: ({ generation, bestFitness, averageFitness }) => {
    if (generation % 10 === 0) {
      console.log(
        `Generation ${generation}: Best Fitness = ${bestFitness}, Average Fitness = ${averageFitness.toFixed(2)}`
      );
    }
    return false; // Continue running
  }
});

// Output results
console.log('\nOptimization Complete!');
console.log('Best solution genes:', bestSolution.genes.join(''));
console.log('Decimal value:', geneticAlgorithmUtils.binaryToDecimal(bestSolution.genes as (0 | 1)[]));
console.log('Fitness value:', bestSolution.fitness);
