import type { Individual, MemeticOptions } from '../index';
import { LocalSearch } from '../../../search/localSearch';
import { SequentialOperator } from '../../../core/pipeline/SequentialOperator';
import { Step as PipelineStep } from '../../../core/pipeline/Step';

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
        const fitnesses = population.map(ind => ind.fitness);
        // Step 1: Selection and offspring creation
        const selectionAndOffspringStep: PipelineStep<Individual<T>[]> = {
            apply: async (pop: Individual<T>[]) => {
                const newPopulation: Individual<T>[] = [];
                const fitnesses = pop.map(ind => ind.fitness);
                while (newPopulation.length < config.populationSize) {
                    const parents = config.selectionOperator.select(pop, fitnesses, 2);
                    const [parent1, parent2] = parents;
                    let offspringGenome =
                        Math.random() < config.crossoverRate
                            ? config.crossoverOperator.crossover(parent1.genome, parent2.genome)[0]
                            : parent1.genome;
                    if (Math.random() < config.mutationRate) {
                        offspringGenome = config.mutationOperator.mutate(offspringGenome);
                    }
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
                return newPopulation;
            }
        };

        // Step 2: Replacement
        const replacementStep: PipelineStep<Individual<T>[]> = {
            apply: async (newPopulation: Individual<T>[]) => {
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
                return population;
            }
        };

        const pipeline = new SequentialOperator<Individual<T>[]>([
            selectionAndOffspringStep,
            replacementStep
        ]);

        population = await pipeline.apply(population);
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
