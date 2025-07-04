import type { Individual, MemeticOptions } from '../index';
import { LocalSearch } from '../../../search/localSearch';

/**
 * Orchestrates the main evolutionary loop for the Memetic Algorithm.
 * This is a standalone component to keep the core class minimal.
 */
export async function memeticLoop<T>(
    population: Individual<T>[],
    config: MemeticOptions<T>,
    localSearcher: LocalSearch<T>,
    updateBest: (population: Individual<T>[]) => Individual<T>,
    applyLocalSearch: (genome: T, config: MemeticOptions<T>, localSearcher: LocalSearch<T>) => Promise<T>
): Promise<Individual<T>> {
    let bestIndividual: Individual<T> | null = null;
    for (let gen = 0; gen < config.generations; gen++) {
        const newPopulation: Individual<T>[] = [];
        const fitnesses = population.map(ind => ind.fitness);
        while (newPopulation.length < config.populationSize) {
            // Selection
            const parents = config.selectionOperator.select(population, fitnesses, 2);
            const [parent1, parent2] = parents;
            // Crossover
            let offspringGenome =
                Math.random() < config.crossoverRate
                    ? config.crossoverOperator.crossover(parent1.genome, parent2.genome)[0]
                    : parent1.genome;
            // Mutation
            if (Math.random() < config.mutationRate) {
                offspringGenome = config.mutationOperator.mutate(offspringGenome);
            }
            // Local Search
            if (Math.random() < config.localSearchRate) {
                offspringGenome = await applyLocalSearch(
                    offspringGenome,
                    config,
                    localSearcher
                );
            }
            const offspringFitness = await config.evaluationOperator.evaluate(offspringGenome);
            newPopulation.push({ genome: offspringGenome, fitness: offspringFitness });
        }
        // Replacement (optional, fallback to generational)
        if (config.replacementOperator) {
            const replaced = await config.replacementOperator.replace(
                population,
                newPopulation,
                newPopulation.map(ind => ind.fitness)
            );
            population = replaced as Individual<T>[];
        } else {
            population = newPopulation;
        }
        bestIndividual = updateBest(population);
        // Termination (optional)
        if (config.terminationOperator && config.terminationOperator.shouldTerminate({
            generation: gen,
            fitness: bestIndividual?.fitness,
            population
        })) {
            break;
        }
    }
    return bestIndividual!;
}
