import { MemeticAlgorithm, Individual } from '../../src/algorithms/memetic';
import { NeighborhoodFunction, ObjectiveFunction } from '../../src/search/types';

describe('MemeticAlgorithm', () => {
    it('should return a solution for a simple numerical problem', async () => {
        // Example problem: maximize f(x) = x^2 for x in [0, 10]
        const fitness = async (x: number) => {
            return x * x;
        };

        const createIndividual = async (): Promise<number> => {
            return Math.floor(Math.random() * 11);
        }
        const mutate = (individual: number) => {
            return Math.max(0, Math.min(10, individual + (Math.random() < 0.5 ? 1 : -1)));
        };
        const crossover = (a: number, b: number) => {
            return Math.round((a + b) / 2);
        };

        // Define neighborhood function for local search
        const neighborhoodFunction: NeighborhoodFunction<number> = (individual: number) => {
            const neighbors: number[] = [];
            const x = individual;

            // Add neighbors +1 and -1 from current value (if within bounds)
            if (x < 10) {
                neighbors.push(x + 1);
            }
            if (x > 0) {
                neighbors.push(x - 1);
            }

            return neighbors;
        };

        const algo = new MemeticAlgorithm<number>({
            populationSize: 10,
            generations: 20,
            crossoverRate: 0.7,
            mutationRate: 0.1,
            localSearchRate: 0.3,
            initialize: createIndividual,
            evaluate: fitness,
            select: (population: Individual<number>[]) => {
                const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
                return [sorted[0], sorted[1]]; // Select top 2 individuals
            },
            mutate,
            crossover,
            objectiveFunction: fitness,
            neighborhoodFunction,
            localSearchOptions: {
                maxIterations: 5,
                maximize: true
            }
        });

        const result = await algo.evolve();
        expect(result.genome).toBeGreaterThanOrEqual(0);
        expect(result.genome).toBeLessThanOrEqual(10);
        // The best solution should be 10 (since 10^2 = 100 is max)
        expect(result.genome).toBe(10);
        expect(result.fitness).toBe(100);
    });

    it('should solve a binary optimization problem', async () => {
        // Define a binary optimization problem (maximize number of 1s)
        type BinaryGenome = number[];
        const GENOME_LENGTH = 20;

        // Create a random binary genome
        const createRandomBinaryGenome = (): BinaryGenome => {
            return Array.from({ length: GENOME_LENGTH }, () => Math.round(Math.random()));
        };

        // Count the number of 1s in the genome (objective function)
        const countOnes: ObjectiveFunction<BinaryGenome> = async (genome: BinaryGenome) => {
            return genome.reduce((sum, gene) => sum + gene, 0);
        };

        // Generate neighborhood by flipping one bit at a time
        const flipOneBitNeighborhood: NeighborhoodFunction<BinaryGenome> = (genome: BinaryGenome) => {
            const neighbors: BinaryGenome[] = [];

            for (let i = 0; i < genome.length; i++) {
                const neighborGenome = [...genome];
                neighborGenome[i] = 1 - neighborGenome[i]; // Flip 0 to 1 or 1 to 0
                neighbors.push(neighborGenome);
            }

            return neighbors;
        };

        const algo = new MemeticAlgorithm<BinaryGenome>({
            populationSize: 20,
            generations: 10,
            crossoverRate: 0.8,
            mutationRate: 0.1,
            localSearchRate: 0.2,
            initialize: async () => createRandomBinaryGenome(),
            evaluate: countOnes,
            select: (population: Individual<BinaryGenome>[]) => {
                const tournamentSize = 3;
                const tournament = () => {
                    const candidates = Array.from(
                        { length: tournamentSize },
                        () => population[Math.floor(Math.random() * population.length)]
                    );
                    return candidates.reduce((best, ind) =>
                        best.fitness > ind.fitness ? best : ind
                    );
                };
                return [tournament(), tournament()];
            },
            crossover: (parent1, parent2) => {
                const point = Math.floor(Math.random() * parent1.length);
                const childGenome = [
                    ...parent1.slice(0, point),
                    ...parent2.slice(point)
                ];
                return childGenome;
            },
            mutate: (genome) => {
                const newGenome = [...genome];
                const mutationPoint = Math.floor(Math.random() * newGenome.length);
                newGenome[mutationPoint] = 1 - newGenome[mutationPoint]; // Flip the bit
                return newGenome;
            },
            objectiveFunction: countOnes,
            neighborhoodFunction: flipOneBitNeighborhood,
            localSearchOptions: {
                maxIterations: 5,
                maximize: true
            }
        });

        const result = await algo.evolve();
        expect(Array.isArray(result.genome)).toBe(true);
        expect(result.genome.length).toBe(GENOME_LENGTH);

        // Given enough iterations, all bits should be 1s (or very close)
        const countOfOnes = result.genome.filter(bit => bit === 1).length;
        expect(countOfOnes).toBeGreaterThanOrEqual(GENOME_LENGTH * 0.9); // At least 90% of bits should be 1
        expect(result.fitness).toBe(countOfOnes);
    });
});