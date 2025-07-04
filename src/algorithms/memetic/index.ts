import { LocalSearch } from '../../search/localSearch';
import { NeighborhoodFunction, ObjectiveFunction } from '../../search/types';
import { InitializationOperator } from '../../core/operators/InitializationOperator';
import { EvaluationOperator } from '../../core/operators/EvaluationOperator';
import { SelectionOperator } from '../../core/operators/SelectionOperator';
import { CrossoverOperator } from '../../core/operators/CrossoverOperator';
import { MutationOperator } from '../../core/operators/MutationOperator';
import { ReplacementOperator } from '../../core/operators/ReplacementOperator';
import { TerminationOperator } from '../../core/operators/TerminationOperator';

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
        this.population = [];
        for (let i = 0; i < this.config.populationSize; i++) {
            // Always use initializationOperator for per-individual initialization
            const result = this.config.initializationOperator.initialize({
                populationSize: 1,
                individualFactory: this.config.individualFactory
            });
            const genome = Array.isArray(result) ? result[0] : result;
            const resolvedGenome = genome instanceof Promise ? await genome : genome;
            const fitness = await this.config.evaluationOperator.evaluate(resolvedGenome as T);
            this.population.push({ genome: resolvedGenome as T, fitness });
        }
        this.updateBest();
    }

    public async evolve(): Promise<Individual<T>> {
        if (this.population.length === 0) {
            await this.initializePopulation();
        }
        for (let gen = 0; gen < this.config.generations; gen++) {
            const newPopulation: Individual<T>[] = [];
            const fitnesses = this.population.map(ind => ind.fitness);
            while (newPopulation.length < this.config.populationSize) {
                // Selection
                const parents = this.config.selectionOperator.select(this.population, fitnesses, 2);
                const [parent1, parent2] = parents;
                // Crossover
                let offspringGenome =
                    Math.random() < this.config.crossoverRate
                        ? this.config.crossoverOperator.crossover(parent1.genome, parent2.genome)[0]
                        : parent1.genome;
                // Mutation
                if (Math.random() < this.config.mutationRate) {
                    offspringGenome = this.config.mutationOperator.mutate(offspringGenome);
                }
                // Local Search
                if (Math.random() < this.config.localSearchRate) {
                    const result = await this.localSearcher.search(
                        offspringGenome,
                        this.config.objectiveFunction,
                        this.config.neighborhoodFunction,
                        this.config.localSearchOptions
                    );
                    offspringGenome = result.solution;
                }
                const offspringFitness = await this.config.evaluationOperator.evaluate(offspringGenome);
                newPopulation.push({ genome: offspringGenome, fitness: offspringFitness });
            }
            // Replacement (optional, fallback to generational)
            if (this.config.replacementOperator) {
                const replaced = await this.config.replacementOperator.replace(
                    this.population,
                    newPopulation,
                    newPopulation.map(ind => ind.fitness)
                );
                this.population = replaced as Individual<T>[];
            } else {
                this.population = newPopulation;
            }
            this.updateBest();
            // Termination (optional)
            if (this.config.terminationOperator && this.config.terminationOperator.shouldTerminate({
                generation: gen,
                fitness: this.bestIndividual?.fitness,
                population: this.population
            })) {
                break;
            }
        }
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