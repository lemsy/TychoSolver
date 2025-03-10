"use strict";
/**
 * GeneticAlgorithm.ts
 * A flexible and powerful genetic algorithm library for TypeScript and JavaScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.geneticAlgorithmUtils = exports.GeneticAlgorithm = void 0;
/**
 * Main genetic algorithm class
 */
class GeneticAlgorithm {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g;
        this.population = [];
        this.bestIndividual = null;
        this.generation = 0;
        /**
         * Tournament selection method
         */
        this.tournamentSelection = (population, fitnessSum) => {
            const tournamentSize = 3;
            let tournament = [];
            // Select random individuals for the tournament
            for (let i = 0; i < tournamentSize; i++) {
                const randomIndex = Math.floor(Math.random() * population.length);
                tournament.push(population[randomIndex]);
            }
            // Return the best individual from the tournament
            return [...tournament].sort((a, b) => b.fitness - a.fitness)[0];
        };
        /**
         * Roulette wheel selection method
         */
        this.rouletteWheelSelection = (population, fitnessSum) => {
            const randomValue = Math.random() * fitnessSum;
            let currentSum = 0;
            for (const individual of population) {
                currentSum += individual.fitness;
                if (currentSum >= randomValue) {
                    return individual;
                }
            }
            // Fallback in case of rounding errors
            return population[population.length - 1];
        };
        /**
         * Single-point crossover method
         */
        this.singlePointCrossover = (parent1, parent2) => {
            if (Math.random() > this.crossoverRate) {
                // No crossover, return copies of parents
                return [
                    { genes: [...parent1.genes], fitness: 0 },
                    { genes: [...parent2.genes], fitness: 0 }
                ];
            }
            // Perform crossover
            const crossoverPoint = Math.floor(Math.random() * (this.geneLength - 1)) + 1;
            const child1 = {
                genes: [
                    ...parent1.genes.slice(0, crossoverPoint),
                    ...parent2.genes.slice(crossoverPoint)
                ],
                fitness: 0
            };
            const child2 = {
                genes: [
                    ...parent2.genes.slice(0, crossoverPoint),
                    ...parent1.genes.slice(crossoverPoint)
                ],
                fitness: 0
            };
            return [child1, child2];
        };
        /**
         * Two-point crossover method
         */
        this.twoPointCrossover = (parent1, parent2) => {
            if (Math.random() > this.crossoverRate) {
                // No crossover, return copies of parents
                return [
                    { genes: [...parent1.genes], fitness: 0 },
                    { genes: [...parent2.genes], fitness: 0 }
                ];
            }
            // Select two crossover points
            let point1 = Math.floor(Math.random() * (this.geneLength - 1)) + 1;
            let point2 = Math.floor(Math.random() * (this.geneLength - point1)) + point1;
            const child1 = {
                genes: [
                    ...parent1.genes.slice(0, point1),
                    ...parent2.genes.slice(point1, point2),
                    ...parent1.genes.slice(point2)
                ],
                fitness: 0
            };
            const child2 = {
                genes: [
                    ...parent2.genes.slice(0, point1),
                    ...parent1.genes.slice(point1, point2),
                    ...parent2.genes.slice(point2)
                ],
                fitness: 0
            };
            return [child1, child2];
        };
        /**
         * Standard mutation method
         */
        this.standardMutation = (individual, geneGenerator) => {
            for (let i = 0; i < individual.genes.length; i++) {
                if (Math.random() < this.mutationRate) {
                    individual.genes[i] = geneGenerator();
                }
            }
        };
        // Set required parameters
        this.populationSize = options.populationSize;
        this.geneLength = options.geneLength;
        this.fitnessFunction = options.fitnessFunction;
        this.geneGenerator = options.geneGenerator;
        // Set optional parameters with defaults
        this.crossoverRate = (_a = options.crossoverRate) !== null && _a !== void 0 ? _a : 0.8;
        this.mutationRate = (_b = options.mutationRate) !== null && _b !== void 0 ? _b : 0.1;
        this.elitismCount = (_c = options.elitismCount) !== null && _c !== void 0 ? _c : 1;
        this.maxGenerations = (_d = options.maxGenerations) !== null && _d !== void 0 ? _d : 100;
        this.targetFitness = options.targetFitness;
        // Set default methods if not provided
        this.selectionMethod = (_e = options.selectionMethod) !== null && _e !== void 0 ? _e : this.tournamentSelection;
        this.crossoverMethod = (_f = options.crossoverMethod) !== null && _f !== void 0 ? _f : this.singlePointCrossover;
        this.mutationMethod = (_g = options.mutationMethod) !== null && _g !== void 0 ? _g : this.standardMutation;
        // Initialize population
        this.initializePopulation();
    }
    /**
     * Initialize the population with random individuals
     */
    initializePopulation() {
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            const genes = [];
            for (let j = 0; j < this.geneLength; j++) {
                genes.push(this.geneGenerator());
            }
            const individual = {
                genes,
                fitness: 0
            };
            individual.fitness = this.fitnessFunction(individual.genes);
            this.population.push(individual);
        }
        // Find the best individual in the initial population
        this.updateBestIndividual();
    }
    /**
     * Update the best individual found so far
     */
    updateBestIndividual() {
        const currentBest = this.getBestIndividual();
        if (!this.bestIndividual || currentBest.fitness > this.bestIndividual.fitness) {
            this.bestIndividual = {
                genes: [...currentBest.genes],
                fitness: currentBest.fitness
            };
        }
    }
    /**
     * Get the best individual from the current population
     */
    getBestIndividual() {
        return [...this.population].sort((a, b) => b.fitness - a.fitness)[0];
    }
    /**
     * Calculate the total fitness of the population
     */
    calculateFitnessSum() {
        return this.population.reduce((sum, individual) => sum + individual.fitness, 0);
    }
    /**
     * Evolve the population to the next generation
     */
    evolve() {
        const nextGeneration = [];
        const fitnessSum = this.calculateFitnessSum();
        // Apply elitism if specified
        if (this.elitismCount > 0) {
            const sortedPopulation = [...this.population].sort((a, b) => b.fitness - a.fitness);
            for (let i = 0; i < this.elitismCount && i < sortedPopulation.length; i++) {
                nextGeneration.push({
                    genes: [...sortedPopulation[i].genes],
                    fitness: sortedPopulation[i].fitness
                });
            }
        }
        // Fill the rest of the population with crossover and mutation
        while (nextGeneration.length < this.populationSize) {
            // Select parents
            const parent1 = this.selectionMethod(this.population, fitnessSum);
            const parent2 = this.selectionMethod(this.population, fitnessSum);
            // Create offspring through crossover
            const [child1, child2] = this.crossoverMethod(parent1, parent2);
            // Apply mutation
            this.mutationMethod(child1, this.geneGenerator);
            this.mutationMethod(child2, this.geneGenerator);
            // Evaluate fitness
            child1.fitness = this.fitnessFunction(child1.genes);
            nextGeneration.push(child1);
            if (nextGeneration.length < this.populationSize) {
                child2.fitness = this.fitnessFunction(child2.genes);
                nextGeneration.push(child2);
            }
        }
        // Replace old population with new generation
        this.population = nextGeneration;
        this.generation++;
        // Update best individual
        this.updateBestIndividual();
    }
    /**
     * Run the genetic algorithm until a termination condition is met
     */
    run(options = {}) {
        var _a, _b;
        const maxGen = (_a = options.maxGenerations) !== null && _a !== void 0 ? _a : this.maxGenerations;
        const targetFit = (_b = options.targetFitness) !== null && _b !== void 0 ? _b : this.targetFitness;
        while (this.generation < maxGen) {
            this.evolve();
            // Calculate statistics
            const bestIndividual = this.getBestIndividual();
            const avgFitness = this.calculateFitnessSum() / this.populationSize;
            // Call generation callback if provided
            if (options.onGenerationComplete) {
                const shouldStop = options.onGenerationComplete({
                    generation: this.generation,
                    bestFitness: bestIndividual.fitness,
                    averageFitness: avgFitness,
                    bestIndividual: bestIndividual
                });
                if (shouldStop) {
                    break;
                }
            }
            // Check if we've reached the target fitness
            if (targetFit !== undefined && bestIndividual.fitness >= targetFit) {
                break;
            }
        }
        if (!this.bestIndividual) {
            throw new Error("No best individual found");
        }
        return this.bestIndividual;
    }
    /**
     * Reset the algorithm to start from generation 0
     */
    reset() {
        this.generation = 0;
        this.bestIndividual = null;
        this.initializePopulation();
    }
    /**
     * Get the current generation number
     */
    getGeneration() {
        return this.generation;
    }
    /**
     * Get the current population
     */
    getPopulation() {
        return [...this.population];
    }
    /**
     * Get the best individual found so far
     */
    getBest() {
        return this.bestIndividual ? Object.assign({}, this.bestIndividual) : null;
    }
}
exports.GeneticAlgorithm = GeneticAlgorithm;
// Export utility functions
exports.geneticAlgorithmUtils = {
    /**
     * Helper to create a binary gene generator
     */
    binaryGeneGenerator: () => Math.random() < 0.5 ? 0 : 1,
    /**
     * Helper to convert binary genes to decimal
     */
    binaryToDecimal: (genes) => {
        return genes.reduce((decimal, bit, index) => {
            if (bit !== 0 && bit !== 1) {
                throw new Error(`Invalid binary value at index ${index}: ${bit}. Only 0 and 1 are allowed.`);
            }
            return decimal + bit * Math.pow(2, genes.length - index - 1);
        }, 0);
    },
    /**
     * Helper to create a gene generator for real values in a range
     */
    realValueGeneGenerator: (min, max) => {
        return () => min + Math.random() * (max - min);
    }
};
