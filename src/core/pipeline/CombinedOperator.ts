import { Operator } from './Operator';

/**
 * Applies multiple operators to the input and combines their results using a user-defined combiner function.
 */
export class CombinedOperator<T> implements Operator<T> {
    constructor(
        private operators: Operator<T>[],
        private combiner: (results: T[]) => T | Promise<T>
    ) { }

    async apply(input: T): Promise<T> {
        const results = await Promise.all(this.operators.map(op => op.apply(input)));
        return await this.combiner(results);
    }
}
