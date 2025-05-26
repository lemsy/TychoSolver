import { Individual, memeticAlgorithm } from '../../src/algorithms/memetic';
import { NeighborhoodFunction, ObjectiveFunction } from '../../src/search/localSearch';

describe('memeticAlgorithm', () => {
    it('should return a solution for a simple numerical problem', () => {
        // Example problem: maximize f(x) = x^2 for x in [0, 10]
        const fitness = (x: Individual) => {
            return x.genome * x.genome;
        };

        const createIndividual = (): Individual => {
            return {
                genome: Math.floor(Math.random() * 11),
                fitness: 0,
            }
        }
        const mutate = (individual: Individual) => {
            return {
                genome: Math.max(0, Math.min(10, individual.genome + (Math.random() < 0.5 ? 1 : -1))),
                fitness: 0,
            };
        };
        const crossover = (a: Individual, b: Individual) => {
            return {
                genome: Math.round((a.genome + b.genome) / 2),
                fitness: 0,
            }
        };

        // Define neighborhood function for local search
        const neighborhoodFunction: NeighborhoodFunction<Individual> = (individual: Individual) => {
            const neighbors: Individual[] = [];
            const x = individual.genome as number;

            // Add neighbors +1 and -1 from current value (if within bounds)
            if (x < 10) {
                neighbors.push({ genome: x + 1, fitness: 0 });
            }
            if (x > 0) {
                neighbors.push({ genome: x - 1, fitness: 0 });
            }

            return neighbors;
        };

        const result = memeticAlgorithm({
            populationSize: 10,
            generations: 20,
            crossoverRate: 0.7,
            mutationRate: 0.1,
            localSearchRate: 0.3,
            initialize: createIndividual,
            evaluate: fitness,
            select: (population: Individual[]) => {
                const sorted = population.sort((a, b) => b.fitness - a.fitness);
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

        expect(result.genome).toBeGreaterThanOrEqual(0);
        expect(result.genome).toBeLessThanOrEqual(10);
        // The best solution should be 10 (since 10^2 = 100 is max)
        expect(result.genome).toBe(10);
        expect(result.fitness).toBe(100);
    });

    it('should solve a binary optimization problem', () => {
        // Define a binary optimization problem (maximize number of 1s)
        type BinaryGenome = number[];
        const GENOME_LENGTH = 20;

        // Create a random binary genome
        const createRandomBinaryGenome = (): BinaryGenome => {
            return Array.from({ length: GENOME_LENGTH }, () => Math.round(Math.random()));
        };

        // Count the number of 1s in the genome (objective function)
        const countOnes: ObjectiveFunction<Individual> = (individual: Individual) => {
            const genome = individual.genome as BinaryGenome;
            return genome.reduce((sum, gene) => sum + gene, 0);
        };

        // Generate neighborhood by flipping one bit at a time
        const flipOneBitNeighborhood: NeighborhoodFunction<Individual> = (individual: Individual) => {
            const genome = individual.genome as BinaryGenome;
            const neighbors: Individual[] = [];

            for (let i = 0; i < genome.length; i++) {
                const neighborGenome = [...genome];
                neighborGenome[i] = 1 - neighborGenome[i]; // Flip 0 to 1 or 1 to 0
                neighbors.push({
                    genome: neighborGenome,
                    fitness: 0 // Will be calculated later
                });
            }

            return neighbors;
        };

        const result = memeticAlgorithm({
            populationSize: 20,
            generations: 10,
            crossoverRate: 0.8,
            mutationRate: 0.1,
            localSearchRate: 0.2,

            // Initialize a random individual
            initialize: () => ({
                genome: createRandomBinaryGenome(),
                fitness: 0
            }),

            // Evaluation function
            evaluate: countOnes,

            // Tournament selection
            select: (population) => {
                const tournamentSize = 3;
                const tournament = () => {
                    const candidates = Array.from(
                        { length: tournamentSize },
                        () => population[Math.floor(Math.random() * population.length)]
                    );
                    return candidates.reduce((best, ind) =>
                        ind.fitness > best.fitness ? ind : best
                    );
                };
                return [tournament(), tournament()];
            },

            // Single-point crossover
            crossover: (parent1, parent2) => {
                const genome1 = parent1.genome as BinaryGenome;
                const genome2 = parent2.genome as BinaryGenome;
                const point = Math.floor(Math.random() * genome1.length);

                const childGenome = [
                    ...genome1.slice(0, point),
                    ...genome2.slice(point)
                ];

                return {
                    genome: childGenome,
                    fitness: 0
                };
            },

            // Bit-flip mutation
            mutate: (individual) => {
                const genome = [...individual.genome] as BinaryGenome;
                const mutationPoint = Math.floor(Math.random() * genome.length);
                genome[mutationPoint] = 1 - genome[mutationPoint]; // Flip the bit

                return {
                    genome,
                    fitness: 0
                };
            },

            // Local search configuration
            objectiveFunction: countOnes,
            neighborhoodFunction: flipOneBitNeighborhood,
            localSearchOptions: {
                maxIterations: 5,
                maximize: true
            }
        });

        expect(Array.isArray(result.genome)).toBe(true);
        expect((result.genome as BinaryGenome).length).toBe(GENOME_LENGTH);

        // Given enough iterations, all bits should be 1s (or very close)
        const countOfOnes = (result.genome as BinaryGenome).filter(bit => bit === 1).length;
        expect(countOfOnes).toBeGreaterThanOrEqual(GENOME_LENGTH * 0.9); // At least 90% of bits should be 1
        expect(result.fitness).toBe(countOfOnes);
    });
});