import { Operator } from './Operator';
export type { Operator };

/**
 * Applies a sequence of operators to the input, passing the result of each to the next.
 */
export class SequentialOperator<T> implements Operator<T> {
    constructor(private operators: Operator<T>[]) { }

    async apply(input: T): Promise<T> {
        let result = input;
        for (const op of this.operators) {
            result = await op.apply(result);
        }
        return result;
    }
}
