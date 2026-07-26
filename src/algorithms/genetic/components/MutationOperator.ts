import { MutationOperator } from '../../../core/operators/MutationOperator';
import { RNG } from '../../../utils/rng';

// Generic mutation operator for array-based individuals
export class MutationOperatorImpl<T extends any[]> implements MutationOperator<T> {
    private geneMutator: (gene: T[number], index: number, individual: T) => T[number];
    private mutationRate: number;
    private readonly rng: RNG | undefined;

    constructor(
        geneMutator?: (gene: T[number], index: number, individual: T) => T[number],
        mutationRate?: number,
        rng?: RNG
    ) {
        // default gene mutator: identity (no change)
        this.geneMutator = geneMutator || ((g: any) => g);
        this.mutationRate = mutationRate ?? 0.01;
        this.rng = rng;
    }

    mutate(individual: T): T {
        const rate = this.mutationRate;

        const mutated = individual.map((gene, idx) => {
            const r = this.rng ? this.rng.random() : Math.random();

            if (r < rate) {
                return this.geneMutator(gene, idx, individual);
            }

            return gene;
        });

        return mutated as T;
    }
}