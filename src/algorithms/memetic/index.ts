import { LocalSearch, NeighborhoodFunction, ObjectiveFunction } from '../../search/localSearch';

export interface Individual<T> {
    genome: T;
    fitness: number;
}

export interface MemeticOptions<T> {
    populationSize: number;
    generations: number;
    crossoverRate: number;
    mutationRate: number;
    localSearchRate: number;
    initialize: () => T | Promise<T>;
    evaluate: (individual: T) => number | Promise<number>;
    select: (population: Individual<T>[]) => [Individual<T>, Individual<T>];
    crossover: (parent1: T, parent2: T) => T;
    mutate: (individual: T) => T;

    // Local search configuration using the general LocalSearch class
    objectiveFunction: ObjectiveFunction<T>;
    neighborhoodFunction: NeighborhoodFunction<T>;
    localSearchOptions?: {
        maxIterations?: number;
        maximize?: boolean;
        costFunction?: (solution: T) => number | Promise<number>;
        maximizeCost?: boolean;
    };
}

export async function memeticAlgorithm<T>(options: MemeticOptions<T>): Promise<Individual<T>> {
    let population: Individual<T>[] = [];
    for (let i = 0; i < options.populationSize; i++) {
        const genome = await options.initialize();
        const fitness = await options.evaluate(genome);
        population.push({ genome, fitness });
    }
    const localSearcher = new LocalSearch<T>();
    for (let gen = 0; gen < options.generations; gen++) {
        const newPopulation: Individual<T>[] = [];
        while (newPopulation.length < options.populationSize) {
            // Selection
            const [parent1, parent2] = options.select(population);
            // Crossover
            let offspringGenome =
                Math.random() < options.crossoverRate
                    ? options.crossover(parent1.genome, parent2.genome)
                    : parent1.genome;
            // Mutation
            if (Math.random() < options.mutationRate) {
                offspringGenome = options.mutate(offspringGenome);
            }
            // Local Search
            if (Math.random() < options.localSearchRate) {
                const result = await localSearcher.search(
                    offspringGenome,
                    options.objectiveFunction,
                    options.neighborhoodFunction,
                    options.localSearchOptions
                );
                offspringGenome = result.solution;
            }
            const offspringFitness = await options.evaluate(offspringGenome);
            newPopulation.push({ genome: offspringGenome, fitness: offspringFitness });
        }
        population = newPopulation;
    }
    // Return the best individual
    let best = population[0];
    for (let i = 1; i < population.length; i++) {
        if (population[i].fitness > best.fitness) {
            best = population[i];
        }
    }
    return best;
}