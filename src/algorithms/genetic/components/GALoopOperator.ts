import { InitializationOperator } from '../../../core/operators/InitializationOperator';
import { EvaluationOperator } from '../../../core/operators/EvaluationOperator';
import { SelectionOperator } from '../../../core/operators/SelectionOperator';
import { CrossoverOperator } from '../../../core/operators/CrossoverOperator';
import { MutationOperator } from '../../../core/operators/MutationOperator';
import { ReplacementOperator } from '../../../core/operators/ReplacementOperator';
import { ElitismOperator } from '../../../core/operators/ElitismOperator';
import { TerminationOperator } from '../../../core/operators/TerminationOperator';
// Import default implementations
import { GAInitializationOperator } from './InitializationOperator';
import { GAEvaluationOperator } from './EvaluationOperator';
import { GATerminationOperator } from './TerminationOperator';
import { SelectionOperatorImpl } from './SelectionOperator';
import { CrossoverOperatorImpl } from './CrossoverOperator';
import { MutationOperatorImpl } from './MutationOperator';
import { ReplacementOperatorImpl } from './ReplacementOperator';
import { ElitismOperatorImpl } from './ElitismOperator';

interface GALoopOperatorConfig<T> {
    population: T[];
    evaluationOperator?: EvaluationOperator<T>;
    selectionOperator?: SelectionOperator<T>;
    crossoverOperator?: CrossoverOperator<T>;
    mutationOperator?: MutationOperator<T>;
    replacementOperator?: ReplacementOperator<T>;
    elitismOperator?: ElitismOperator<T>;
    terminationOperator?: TerminationOperator<T>;
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

    // Provide sensible defaults if any operator is missing
    // Helper to check if fitnessFunction is synchronous
    const isSyncFitness = (fn: any) => {
        try {
            const res = fn(population[0]);
            return !(res instanceof Promise);
        } catch {
            return true;
        }
    };
    let evalOp: EvaluationOperator<T>;
    if (evaluationOperator) {
        evalOp = evaluationOperator;
    } else if (isSyncFitness(fitnessFunction)) {
        evalOp = new GAEvaluationOperator<T>(fitnessFunction as (ind: T) => number);
    } else {
        // fallback: async-compatible evaluation operator for single individual
        evalOp = {
            evaluate: (solution: T) => fitnessFunction(solution)
        };
    }
    const selectOp = selectionOperator || (new SelectionOperatorImpl<T>() as SelectionOperator<T>);
    let crossOp: CrossoverOperator<T>;
    if (crossoverOperator) {
        crossOp = crossoverOperator;
    } else {
        try {
            crossOp = new (CrossoverOperatorImpl as any)() as CrossoverOperator<T>;
        } catch {
            throw new Error('No default crossover operator for this individual type. Please provide one.');
        }
    }
    let mutOp: MutationOperator<T>;
    if (mutationOperator) {
        mutOp = mutationOperator;
    } else {
        try {
            mutOp = new (MutationOperatorImpl as any)() as MutationOperator<T>;
        } catch {
            throw new Error('No default mutation operator for this individual type. Please provide one.');
        }
    }
    const replOp = replacementOperator || (new ReplacementOperatorImpl<T>() as ReplacementOperator<T>);
    const elitOp = elitismOperator || (new ElitismOperatorImpl<T>() as ElitismOperator<T>);
    const termOp = terminationOperator || (new GATerminationOperator<T>() as TerminationOperator<T>);

    while (generation < maxGenerations && !termOp.shouldTerminate(pop)) {
        // Evaluate fitnesses (await if async)
        const fitnesses: number[] = await Promise.all(pop.map(ind => evalOp.evaluate(ind)));

        // Selection
        const parents = selectOp.select(pop, fitnesses, pop.length);

        // Crossover & Mutation
        let offspring: T[] = [];
        for (let i = 0; i < parents.length; i += 2) {
            const parent1 = parents[i];
            const parent2 = parents[i + 1] || parents[0];
            const [child1, child2] = crossOp.crossover(parent1, parent2);
            offspring.push(mutOp.mutate(child1));
            offspring.push(mutOp.mutate(child2));
        }

        // Elitism
        const elites = eliteCount > 0 ? elitOp.apply(pop, fitnesses, eliteCount) : [];

        // Replacement
        pop = replOp.replace(pop, offspring, fitnesses);

        // Insert elites
        if (elites.length > 0) {
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
