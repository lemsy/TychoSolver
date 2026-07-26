import { describe, it, expect } from 'vitest';

import { MemeticAlgorithm, Individual } from '../../../src/algorithms/memetic';
import { GAEvaluationOperator } from '../../../src/algorithms/genetic/components/EvaluationOperator';
import { SelectionOperatorImpl } from '../../../src/algorithms/genetic/components/SelectionOperator';
import { CrossoverOperatorImpl } from '../../../src/algorithms/genetic/components/CrossoverOperator';
import { MutationOperatorImpl } from '../../../src/algorithms/genetic/components/MutationOperator';
import { MemeticInitializationOperator } from '../../../src/algorithms/memetic/components/MemeticInitializationOperator';

describe('MemeticAlgorithm - Knapsack Problem', () => {
    it('should solve the 0/1 Knapsack problem', async () => {
        // Problem setup
        const ITEMS = [
            { weight: 2, value: 3 },
            { weight: 3, value: 4 },
            { weight: 4, value: 5 },
            { weight: 5, value: 8 },
            { weight: 9, value: 10 }
        ] as const;

        const CAPACITY = 15;
        const GENOME_LENGTH = ITEMS.length;
        type KnapsackGenome = number[];

        // Individual factory: random 0/1 vector
        const knapsackIndividualFactory = (): KnapsackGenome =>
            Array.from({ length: GENOME_LENGTH }, () => Math.round(Math.random()));

        // Fitness: maximize value, penalize overweight
        const knapsackFitness = (genome: KnapsackGenome): number => {
            let totalWeight = 0;
            let totalValue = 0;

            for (let i = 0; i < genome.length; i++) {
                if (genome[i] === 1) {
                    const item = ITEMS[i]!;
                    totalWeight += item.weight;
                    totalValue += item.value;
                }
            }

            return totalWeight > CAPACITY ? 0 : totalValue;
        };

        // Neighborhood: flip each bit
        const knapsackNeighborhood = (genome: KnapsackGenome): KnapsackGenome[] => {
            const neighbors: KnapsackGenome[] = [];

            for (let i = 0; i < genome.length; i++) {
                const neighbor = [...genome];
                neighbor[i] = 1 - (neighbor[i] ?? 0);
                neighbors.push(neighbor);
            }

            return neighbors;
        };

        const initializationOperator = new MemeticInitializationOperator<KnapsackGenome>(knapsackIndividualFactory);
        const evaluationOperator = new GAEvaluationOperator<KnapsackGenome>(knapsackFitness);
        const selectionOperator = new SelectionOperatorImpl<Individual<KnapsackGenome>>();
        const crossoverOperator = new CrossoverOperatorImpl<KnapsackGenome>();
        const mutationOperator = new MutationOperatorImpl<KnapsackGenome>(
            (gene) => 1 - gene
        );

        const algo = new MemeticAlgorithm<KnapsackGenome>({
            populationSize: 30,
            generations: 30,
            crossoverRate: 0.8,
            mutationRate: 0.1,
            localSearchRate: 0.3,
            initializationOperator,
            evaluationOperator,
            selectionOperator,
            crossoverOperator,
            mutationOperator,
            individualFactory: knapsackIndividualFactory,
            objectiveFunction: knapsackFitness,
            neighborhoodFunction: knapsackNeighborhood,
            localSearchOptions: {
                maxIterations: 5,
                maximize: true
            }
        });

        const result = await algo.evolve();

        expect(result.fitness).toBeGreaterThanOrEqual(18);

        const totalWeight = result.genome.reduce(
            (sum, bit, i) => sum + (bit ? ITEMS[i]!.weight : 0),
            0
        );

        expect(totalWeight).toBeLessThanOrEqual(CAPACITY);
    });
});