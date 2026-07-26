import { ReplacementOperator } from '../../../core/operators/ReplacementOperator';
import { ElitismOperator } from '../../../core/operators/ElitismOperator';

// Generational replacement: replace entire population with offspring, insert elites if provided
export class ReplacementOperatorImpl<T> implements ReplacementOperator<T> {
    private readonly elitismOperator: ElitismOperator<T> | undefined;
    private readonly eliteCount: number;
    private readonly fitnessFunction: ((ind: T) => number | Promise<number>) | undefined;

    constructor(options?: {
        elitismOperator?: ElitismOperator<T>;
        eliteCount?: number;
        fitnessFunction?: (ind: T) => number | Promise<number>;
    }) {
        this.elitismOperator = options?.elitismOperator;
        this.eliteCount = options?.eliteCount ?? 0;
        this.fitnessFunction = options?.fitnessFunction;
    }

    // If elites are provided, insert them into the new population (replace worst)
    async replace(
        oldPopulation: T[],
        offspring: T[],
        fitnesses: number[]
    ): Promise<T[]> {
        const newPop = offspring.slice(0, oldPopulation.length);

        if (this.elitismOperator && this.eliteCount > 0 && this.fitnessFunction) {
            // Evaluate fitness for newPop
            const popWithFitness = await Promise.all(
                newPop.map(async (ind, idx) => ({
                    ind,
                    fit: await this.fitnessFunction!(ind),
                    idx
                }))
            );

            // Ascending, worst first
            popWithFitness.sort((a, b) => a.fit - b.fit);

            // Get elites from old population
            const elites = this.elitismOperator.apply(
                oldPopulation,
                fitnesses,
                this.eliteCount
            );

            const count = Math.min(elites.length, popWithFitness.length);

            for (let i = 0; i < count; i++) {
                newPop[popWithFitness[i]!.idx] = elites[i]!;
            }
        }

        return newPop;
    }
}