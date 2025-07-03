import { InitializationOperator } from '../../../core/operators/InitializationOperator';
import { EvaluationOperator } from '../../../core/operators/EvaluationOperator';
import { SelectionOperator } from '../../../core/operators/SelectionOperator';
import { CrossoverOperator } from '../../../core/operators/CrossoverOperator';
import { MutationOperator } from '../../../core/operators/MutationOperator';
import { ReplacementOperator } from '../../../core/operators/ReplacementOperator';
import { ElitismOperator } from '../../../core/operators/ElitismOperator';
import { TerminationOperator } from '../../../core/operators/TerminationOperator';

interface GALoopOperatorConfig<T> {
    population: T[];
    evaluationOperator: EvaluationOperator<T>;
    selectionOperator: SelectionOperator<T>;
    crossoverOperator: CrossoverOperator<T>;
    mutationOperator: MutationOperator<T>;
    replacementOperator: ReplacementOperator<T>;
    elitismOperator: ElitismOperator<T>;
    terminationOperator: TerminationOperator<T>;
    fitnessFunction: (ind: T) => number | Promise<number>;
    maxGenerations: number;
    eliteCount?: number;
    fitnessLimit?: number;
}

export const GALoopOperator = async <T>({
    population,
    evaluationOperator,
    selectionOperator,
    crossoverOperator,
    mutationOperator,
    replacementOperator,
    elitismOperator,
    terminationOperator,
    fitnessFunction,
    maxGenerations,
    eliteCount = 0,
    fitnessLimit
}: GALoopOperatorConfig<T>): Promise<{ bestSolution: T; bestFitness: number; population: T[]; generation: number }> => {
    let pop = population;
    let bestSolution: T = pop[0];
    let bestFitness = -Infinity;
    let generation = 0;

    while (generation < maxGenerations && !terminationOperator.shouldTerminate(pop)) {
        // Evaluate fitnesses (await if async)
        const fitnesses: number[] = await Promise.all(pop.map(fitnessFunction));

        // Selection
        const parents = selectionOperator.select(pop, fitnesses, pop.length);

        // Crossover & Mutation
        let offspring: T[] = [];
        for (let i = 0; i < parents.length; i += 2) {
            const parent1 = parents[i];
            const parent2 = parents[i + 1] || parents[0];
            const [child1, child2] = crossoverOperator.crossover(parent1, parent2);
            offspring.push(mutationOperator.mutate(child1));
            offspring.push(mutationOperator.mutate(child2));
        }

        // Elitism
        const elites = eliteCount > 0 ? elitismOperator.apply(pop, fitnesses, eliteCount) : [];

        // Replacement
        pop = replacementOperator.replace(pop, offspring, fitnesses);

        // Insert elites
        if (elites.length > 0) {
            // Replace worst individuals with elites
            const popWithFitness = await Promise.all(pop.map(async (ind, idx) => ({ ind, fit: await fitnessFunction(ind), idx })));
            popWithFitness.sort((a, b) => a.fit - b.fit); // ascending, worst first
            for (let i = 0; i < elites.length; ++i) {
                pop[popWithFitness[i].idx] = elites[i];
            }
        }

        // Update best
        const genBestIdx = fitnesses.indexOf(Math.max(...fitnesses));
        if (fitnesses[genBestIdx] > bestFitness) {
            bestFitness = fitnesses[genBestIdx];
            bestSolution = pop[genBestIdx];
        }
        if (fitnessLimit !== undefined && bestFitness >= fitnessLimit) break;
        generation++;
    }
    return { bestSolution, bestFitness, population: pop, generation };
};
