import { MutationOperator } from '../../../core/operators/MutationOperator';

// Generic mutation operator for array-based individuals
export class MutationOperatorImpl<T extends any[]> implements MutationOperator<T> {
    private geneMutator: (gene: T[number], index: number, individual: T) => T[number];
    private mutationRate: number;

    constructor(
        geneMutator: (gene: T[number], index: number, individual: T) => T[number],
        mutationRate?: number
    ) {
        this.geneMutator = geneMutator;
        this.mutationRate = mutationRate ?? 1;
    }

    mutate(individual: T): T {
        const rate = this.mutationRate / individual.length;
        const mutated = individual.map((gene, idx) => {
            if (Math.random() < rate) {
                return this.geneMutator(gene, idx, individual);
            }
            return gene;
        });
        return mutated as T;
    }
}
