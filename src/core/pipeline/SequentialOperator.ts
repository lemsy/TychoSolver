import { Step } from './Step';

/**
 * Applies a sequence of steps to the input, passing the result of each to the next.
 */
export class SequentialOperator<T> implements Step<T> {
    constructor(private steps: Step<T>[]) { }

    async apply(input: T): Promise<T> {
        let result = input;
        for (const step of this.steps) {
            result = await step.apply(result);
        }
        return result;
    }
}
