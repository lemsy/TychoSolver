import { CrossoverOperator } from '../../../core/operators/CrossoverOperator';

// One-point crossover for array-based individuals
export class CrossoverOperatorImpl<T extends any[]> implements CrossoverOperator<T> {
    crossover(parent1: T, parent2: T): [T, T] {
        if (parent1.length !== parent2.length) return [parent1, parent2];
        const point = Math.floor(Math.random() * parent1.length);
        const child1 = [...parent1.slice(0, point), ...parent2.slice(point)] as T;
        const child2 = [...parent2.slice(0, point), ...parent1.slice(point)] as T;
        return [child1, child2];
    }
}
