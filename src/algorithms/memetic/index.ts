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
    localSearch: (individual: Individual) => Individual;
}

export function memeticAlgorithm(options: MemeticOptions): Individual {
    let population: Individual[] = Array.from(
        { length: options.populationSize },
        () => {
            const ind = options.initialize();
            ind.fitness = options.evaluate(ind);
            return ind;
        }
    );

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
                offspring = options.localSearch(offspring);
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