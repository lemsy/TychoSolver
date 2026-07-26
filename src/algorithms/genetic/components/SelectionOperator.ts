import { SelectionOperator } from '../../../core/operators/SelectionOperator';
import { RNG } from '../../../utils/rng';

export class SelectionOperatorImpl<T> implements SelectionOperator<T> {
    private readonly rng: RNG | undefined;

    constructor(rng?: RNG) {
        this.rng = rng;
    }

    // Tournament selection as the default logic
    select(
        population: T[],
        fitnesses: number[],
        numParents: number,
        tournamentSize: number = 2
    ): T[] {
        const selected: T[] = [];
        const n = population.length;

        if (n === 0) {
            return selected;
        }

        const tSize = Math.max(1, Math.min(tournamentSize, n));

        for (let i = 0; i < numParents; i++) {
            // Randomly pick tSize individuals (with replacement)
            const indices: number[] = [];

            for (let k = 0; k < tSize; k++) {
                const idx = this.rng
                    ? this.rng.int(n)
                    : Math.floor(Math.random() * n);

                indices.push(Math.max(0, Math.min(n - 1, idx)));
            }

            let bestIdx = indices[0]!;

            for (const idx of indices) {
                if ((fitnesses[idx] ?? -Infinity) > (fitnesses[bestIdx]! ?? -Infinity)) {
                    bestIdx = idx;
                }
            }

            selected.push(population[bestIdx]!);
        }

        return selected;
    }
}