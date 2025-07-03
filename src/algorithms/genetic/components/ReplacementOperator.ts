import { ReplacementOperator } from '../../../core/operators/ReplacementOperator';

// Generational replacement: replace entire population with offspring
export class ReplacementOperatorImpl<T> implements ReplacementOperator<T> {
    replace(oldPopulation: T[], offspring: T[], fitnesses: number[]): T[] {
        return offspring.slice(0, oldPopulation.length);
    }
}
