import { CrossoverOperator } from '../../../core/operators/CrossoverOperator';
import { RNG } from '../../../utils/rng';

// One-point crossover for array-based individuals
export class CrossoverOperatorImpl<T extends any[]> implements CrossoverOperator<T> {
    private readonly rng: RNG | undefined;

    constructor(rng?: RNG) {
        this.rng = rng;
    }

    crossover(parent1: T, parent2: T): T[] {
        if (parent1.length !== parent2.length) {
            return [parent1, parent2];
        }

        const point = this.rng
            ? this.rng.int(parent1.length)
            : Math.floor(Math.random() * parent1.length);

        const child1 = [
            ...parent1.slice(0, point),
            ...parent2.slice(point)
        ] as T;

        const child2 = [
            ...parent2.slice(0, point),
            ...parent1.slice(point)
        ] as T;

        return [child1, child2];
    }
}