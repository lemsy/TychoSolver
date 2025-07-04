import { MemeticAlgorithm, Individual } from '../../../src/algorithms/memetic';
import { GAEvaluationOperator } from '../../../src/algorithms/genetic/components/EvaluationOperator';
import { SelectionOperatorImpl } from '../../../src/algorithms/genetic/components/SelectionOperator';
import { CrossoverOperatorImpl } from '../../../src/algorithms/genetic/components/CrossoverOperator';
import { MutationOperatorImpl } from '../../../src/algorithms/genetic/components/MutationOperator';
import { MemeticInitializationOperator } from '../../../src/algorithms/memetic/components/MemeticInitializationOperator';

describe('MemeticAlgorithm - OneMax Problem', () => {
    it('should solve the OneMax problem (maximize number of 1s)', async () => {
        // OneMax: maximize the number of 1s in a bitstring
        const GENOME_LENGTH = 20;
        type OneMaxGenome = number[];
        const oneMaxIndividualFactory = (): OneMaxGenome =>
            Array.from({ length: GENOME_LENGTH }, () => Math.round(Math.random()));
        const oneMaxFitness = (genome: OneMaxGenome): number =>
            genome.reduce((sum, gene) => sum + gene, 0);
        const oneMaxNeighborhood = (genome: OneMaxGenome): OneMaxGenome[] => {
            const neighbors: OneMaxGenome[] = [];
            for (let i = 0; i < genome.length; i++) {
                const neighbor = [...genome];
                neighbor[i] = 1 - neighbor[i];
                neighbors.push(neighbor);
            }
            return neighbors;
        };

        const initializationOperator = new MemeticInitializationOperator<OneMaxGenome>(oneMaxIndividualFactory);
        const evaluationOperator = new GAEvaluationOperator<OneMaxGenome>(oneMaxFitness);
        const selectionOperator = new SelectionOperatorImpl<Individual<OneMaxGenome>>();
        const crossoverOperator = new CrossoverOperatorImpl<OneMaxGenome>();
        const mutationOperator = new MutationOperatorImpl<OneMaxGenome>((gene) => 1 - gene);

        const algo = new MemeticAlgorithm<OneMaxGenome>({
            populationSize: 20,
            generations: 15,
            crossoverRate: 0.8,
            mutationRate: 0.1,
            localSearchRate: 0.2,
            initializationOperator,
            evaluationOperator,
            selectionOperator,
            crossoverOperator,
            mutationOperator,
            individualFactory: oneMaxIndividualFactory,
            objectiveFunction: oneMaxFitness,
            neighborhoodFunction: oneMaxNeighborhood,
            localSearchOptions: {
                maxIterations: 5,
                maximize: true
            }
        });

        const result = await algo.evolve();
        expect(Array.isArray(result.genome)).toBe(true);
        expect(result.genome.length).toBe(GENOME_LENGTH);
        const countOfOnes = result.genome.filter(bit => bit === 1).length;
        expect(countOfOnes).toBeGreaterThanOrEqual(GENOME_LENGTH * 0.9); // At least 90% of bits should be 1
        expect(result.fitness).toBe(countOfOnes);
    });
});
