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
    population?: T[]; // Now optional, can be created by InitializationOperator
    initializationOperator?: InitializationOperator<T>;
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
    populationSize?: number; // For initialization
}

export const GALoopOperator = async <T>({
    population,
    initializationOperator,
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
    fitnessLimit,
    populationSize = 100 // default size if not provided
}: GALoopOperatorConfig<T>): Promise<{ bestSolution: T; bestFitness: number; population: T[]; generation: number }> => {
    // --- InitializationOperator creates the population if not provided ---
    const initOp = initializationOperator || new GAInitializationOperator<T>();
    let pop: T[] = population ? population : (await (initOp.initialize ? initOp.initialize(populationSize) : [])) as T[];
    if (!pop || pop.length === 0) throw new Error('Population could not be initialized.');
    let bestSolution: T = pop[0];
    let bestFitness = -Infinity;
    let generation = 0;

    // --- EvaluationOperator ---
    const isSyncFitness = (fn: any) => {
        try {
            const res = fn(pop[0]);
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
        evalOp = { evaluate: (solution: T) => fitnessFunction(solution) };
    }

    // --- ElitismOperator ---
    const elitOp = elitismOperator || (new ElitismOperatorImpl<T>() as ElitismOperator<T>);

    // --- ReplacementOperator (can depend on ElitismOperator) ---
    const replOp = replacementOperator || (new ReplacementOperatorImpl<T>() as ReplacementOperator<T>);

    // --- SelectionOperator ---
    const selectOp = selectionOperator || (new SelectionOperatorImpl<T>() as SelectionOperator<T>);

    // --- CrossoverOperator ---
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

    // --- MutationOperator ---
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

    // --- TerminationOperator ---
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

        // Replacement (now can use elitism if needed)
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
