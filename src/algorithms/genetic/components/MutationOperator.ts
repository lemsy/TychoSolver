import { MutationOperator } from '../../../core/operators/MutationOperator';

// Bit-flip mutation for array-based binary individuals
export class MutationOperatorImpl<T extends number[]> implements MutationOperator<T> {
    mutate(individual: T): T {
        const mutationRate = 1 / individual.length;
        const mutated = individual.map(gene => {
            if (Math.random() < mutationRate) {
                return gene === 0 ? 1 : 0;
            }
            return gene;
        });
        return mutated as T;
    }
}
