import { LocalSearch, NeighborhoodFunction, ObjectiveFunction } from '../../search/localSearch';

export type Individual = {
    genome: any; // Replace 'any' with your genome type
    fitness: number;
};

export interface MemeticOptions {
    populationSize: number;
    generations: number;
    crossoverRate: number;
    mutationRate: number;
    localSearchRate: number;
    initialize: () => Individual;
    evaluate: (individual: Individual) => number;
    select: (population: Individual[]) => [Individual, Individual];
    crossover: (parent1: Individual, parent2: Individual) => Individual;
    mutate: (individual: Individual) => Individual;

    // Local search configuration using the general LocalSearch class
    objectiveFunction: ObjectiveFunction<Individual>;
    neighborhoodFunction: NeighborhoodFunction<Individual>;
    localSearchOptions?: {
        maxIterations?: number;
        maximize?: boolean;
    };
}

export function memeticAlgorithm(options: MemeticOptions): Individual {
    let population: Individual[] = Array.from(
        { length: options.populationSize },
        () => {
            const ind = options.initialize();
            ind.fitness = options.evaluate(ind);
            return ind;
        }
    );    // Create a LocalSearch instance
    const localSearcher = new LocalSearch<Individual>();

    for (let gen = 0; gen < options.generations; gen++) {
        const newPopulation: Individual[] = [];

        while (newPopulation.length < options.populationSize) {
            // Selection
            const [parent1, parent2] = options.select(population);

            // Crossover
            let offspring =
                Math.random() < options.crossoverRate
                    ? options.crossover(parent1, parent2)
                    : { ...parent1 };

            // Mutation
            if (Math.random() < options.mutationRate) {
                offspring = options.mutate(offspring);
            }

            // Local Search
            if (Math.random() < options.localSearchRate) {
                // Use the general LocalSearch approach
                const result = localSearcher.search(
                    offspring,
                    options.objectiveFunction,
                    options.neighborhoodFunction,
                    options.localSearchOptions
                );
                offspring = result.solution;
                offspring.fitness = result.fitness;
            }

            offspring.fitness = options.evaluate(offspring);
            newPopulation.push(offspring);
        }

        population = newPopulation;
    }

    // Return the best individual
    return population.reduce((best, ind) =>
        ind.fitness > best.fitness ? ind : best
    );
}