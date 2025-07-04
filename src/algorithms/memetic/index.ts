import { LocalSearch } from '../../search/localSearch';
import type { NeighborhoodFunction, ObjectiveFunction } from '../../search/types';
import type { InitializationOperator } from '../../core/operators/InitializationOperator';
import type { EvaluationOperator } from '../../core/operators/EvaluationOperator';
import type { SelectionOperator } from '../../core/operators/SelectionOperator';
import type { CrossoverOperator } from '../../core/operators/CrossoverOperator';
import type { MutationOperator } from '../../core/operators/MutationOperator';
import type { ReplacementOperator } from '../../core/operators/ReplacementOperator';
import type { TerminationOperator } from '../../core/operators/TerminationOperator';
import { memeticLoop } from './components/LoopOperator';

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
    initializationOperator: InitializationOperator<T>;
    evaluationOperator: EvaluationOperator<T>;
    selectionOperator: SelectionOperator<Individual<T>>;
    crossoverOperator: CrossoverOperator<T>;
    mutationOperator: MutationOperator<T>;
    replacementOperator?: ReplacementOperator<Individual<T>>;
    terminationOperator?: TerminationOperator<Individual<T>>;
    objectiveFunction: ObjectiveFunction<T>;
    neighborhoodFunction: NeighborhoodFunction<T>;
    localSearchOptions?: {
        maxIterations?: number;
        maximize?: boolean;
        costFunction?: (solution: T) => number | Promise<number>;
        maximizeCost?: boolean;
    };
    individualFactory: () => T;
}

// Helper: population initialization
async function initializePopulation<T>(config: MemeticOptions<T>): Promise<Individual<T>[]> {
    const population: Individual<T>[] = [];
    for (let i = 0; i < config.populationSize; i++) {
        const result = config.initializationOperator.initialize({
            populationSize: 1,
            individualFactory: config.individualFactory
        });
        const genome = Array.isArray(result) ? result[0] : result;
        const resolvedGenome = genome instanceof Promise ? await genome : genome;
        const fitness = await config.evaluationOperator.evaluate(resolvedGenome as T);
        population.push({ genome: resolvedGenome as T, fitness });
    }
    return population;
}

// Helper: local search application
async function applyLocalSearch<T>(
    genome: T,
    config: MemeticOptions<T>,
    localSearcher: LocalSearch<T>
): Promise<T> {
    const { objectiveFunction, neighborhoodFunction, localSearchOptions } = config;
    const result = await localSearcher.search(
        genome,
        objectiveFunction,
        neighborhoodFunction,
        localSearchOptions
    );
    return result.solution;
}

export class MemeticAlgorithm<T> {
    private population: Individual<T>[] = [];
    private config: MemeticOptions<T>;
    private localSearcher: LocalSearch<T>;
    private bestIndividual: Individual<T> | null = null;

    constructor(config: MemeticOptions<T>) {
        this.config = config;
        this.localSearcher = new LocalSearch<T>();
    }

    public async initializePopulation() {
        this.population = await initializePopulation(this.config);
        this.updateBest();
    }

    public async evolve(): Promise<Individual<T>> {
        if (this.population.length === 0) {
            await this.initializePopulation();
        }
        // Use the new LoopOperator for orchestration
        this.bestIndividual = await memeticLoop(
            this.population,
            this.config,
            this.localSearcher,
            (pop) => {
                if (!pop.length) return null as any;
                return pop.reduce((best, ind) => ind.fitness > best.fitness ? ind : best);
            },
            applyLocalSearch
        );
        return this.getBestIndividual();
    }

    public getBestIndividual(): Individual<T> {
        if (!this.bestIndividual && this.population.length > 0) {
            this.updateBest();
        }
        return this.bestIndividual!;
    }

    private updateBest() {
        if (this.population.length === 0) return;
        this.bestIndividual = this.population.reduce((best, ind) =>
            ind.fitness > best.fitness ? ind : best
        );
    }

    public getPopulation(): Individual<T>[] {
        return this.population;
    }
}