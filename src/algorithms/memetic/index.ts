import { LocalSearch } from '../../search/localSearch';
import { NeighborhoodFunction, ObjectiveFunction } from '../../search/types';

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
    initialize: () => T | Promise<T>;
    evaluate: (individual: T) => number | Promise<number>;
    select: (population: Individual<T>[]) => [Individual<T>, Individual<T>];
    crossover: (parent1: T, parent2: T) => T;
    mutate: (individual: T) => T;
    objectiveFunction: ObjectiveFunction<T>;
    neighborhoodFunction: NeighborhoodFunction<T>;
    localSearchOptions?: {
        maxIterations?: number;
        maximize?: boolean;
        costFunction?: (solution: T) => number | Promise<number>;
        maximizeCost?: boolean;
    };
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
            const genome = await this.config.initialize();
            const fitness = await this.config.evaluate(genome);
            this.population.push({ genome, fitness });
        }
        this.updateBest();
    }

    public async evolve(): Promise<Individual<T>> {
        if (this.population.length === 0) {
            await this.initializePopulation();
        }
        for (let gen = 0; gen < this.config.generations; gen++) {
            const newPopulation: Individual<T>[] = [];
            while (newPopulation.length < this.config.populationSize) {
                // Selection
                const [parent1, parent2] = this.config.select(this.population);
                // Crossover
                let offspringGenome =
                    Math.random() < this.config.crossoverRate
                        ? this.config.crossover(parent1.genome, parent2.genome)
                        : parent1.genome;
                // Mutation
                if (Math.random() < this.config.mutationRate) {
                    offspringGenome = this.config.mutate(offspringGenome);
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
                const offspringFitness = await this.config.evaluate(offspringGenome);
                newPopulation.push({ genome: offspringGenome, fitness: offspringFitness });
            }
            this.population = newPopulation;
            this.updateBest();
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