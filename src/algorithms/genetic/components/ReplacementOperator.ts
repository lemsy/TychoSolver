import { ReplacementOperator } from '../../../core/operators/ReplacementOperator';
import { ElitismOperator } from '../../../core/operators/ElitismOperator';

// Generational replacement: replace entire population with offspring, insert elites if provided
export class ReplacementOperatorImpl<T> implements ReplacementOperator<T> {
    private elitismOperator?: ElitismOperator<T>;
    private eliteCount: number;
    private fitnessFunction?: (ind: T) => number | Promise<number>;

    constructor(options?: { elitismOperator?: ElitismOperator<T>; eliteCount?: number; fitnessFunction?: (ind: T) => number | Promise<number> }) {
        this.elitismOperator = options?.elitismOperator;
        this.eliteCount = options?.eliteCount || 0;
        this.fitnessFunction = options?.fitnessFunction;
    }

    // If elites are provided, insert them into the new population (replace worst)
    async replace(oldPopulation: T[], offspring: T[], fitnesses: number[]): Promise<T[]> {
        let newPop = offspring.slice(0, oldPopulation.length);
        if (this.elitismOperator && this.eliteCount > 0 && this.fitnessFunction) {
            // Evaluate fitness for newPop
            const popWithFitness = await Promise.all(newPop.map(async (ind, idx) => ({ ind, fit: await this.fitnessFunction!(ind), idx })));
            popWithFitness.sort((a, b) => a.fit - b.fit); // ascending, worst first
            // Get elites from old population
            const elites = this.elitismOperator.apply(oldPopulation, fitnesses, this.eliteCount);
            for (let i = 0; i < elites.length; ++i) {
                newPop[popWithFitness[i].idx] = elites[i];
            }
        }
        return newPop;
    }
}
