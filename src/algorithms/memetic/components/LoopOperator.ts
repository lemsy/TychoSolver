import type { Individual, MemeticOptions } from '../index';
import { LocalSearch } from '../../../search/localSearch';
import { SequentialOperator } from '../../../core/pipeline/SequentialOperator';
import { RNG } from '../../../utils/rng';
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
    applyLocalSearch: (
        genome: T,
        config: MemeticOptions<T>,
        localSearcher: LocalSearch<T>
    ) => Promise<T>,
    rng?: RNG
): Promise<Individual<T>> {
    let bestIndividual: Individual<T> | null = null;

    for (let gen = 0; gen < config.generations; gen++) {
        // Step 1: Selection and offspring creation
        const selectionAndOffspringStep: PipelineStep<Individual<T>[]> = {
            apply: async (pop: Individual<T>[]) => {
                const newPopulation: Individual<T>[] = [];
                const fitnesses = pop.map(ind => ind.fitness);

                while (newPopulation.length < config.populationSize) {
                    const parents = config.selectionOperator.select(pop, fitnesses, 2);

                    const parent1 = parents[0]!;
                    const parent2 = parents[1] ?? parent1;

                    const r1 = rng ? rng.random() : Math.random();

                    let offspringGenome: T;

                    if (r1 < config.crossoverRate) {
                        const crossRes = config.crossoverOperator.crossover(
                            parent1.genome,
                            parent2.genome
                        );

                        const children =
                            crossRes && typeof (crossRes as any).then === 'function'
                                ? await (crossRes as Promise<T[]>)
                                : (crossRes as T[]);

                        offspringGenome = children[0]!;
                    } else {
                        offspringGenome = parent1.genome;
                    }

                    const r2 = rng ? rng.random() : Math.random();

                    if (r2 < config.mutationRate) {
                        offspringGenome = config.mutationOperator.mutate(offspringGenome);
                    }

                    const r3 = rng ? rng.random() : Math.random();

                    if (r3 < config.localSearchRate) {
                        offspringGenome = await applyLocalSearch(
                            offspringGenome,
                            config,
                            localSearcher
                        );
                    }

                    const offspringFitness = await config.evaluationOperator.evaluate(
                        offspringGenome
                    );

                    newPopulation.push({
                        genome: offspringGenome,
                        fitness: offspringFitness
                    });
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
        if (
            config.terminationOperator &&
            config.terminationOperator.shouldTerminate({
                generation: gen,
                fitness: bestIndividual?.fitness,
                population
            })
        ) {
            break;
        }
    }

    return bestIndividual!;
}