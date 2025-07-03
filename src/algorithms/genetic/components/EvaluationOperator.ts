import { EvaluationOperator } from '../../../core/operators/EvaluationOperator';

// GA-specific: evaluates fitness for an individual using a provided fitness function
export class GAEvaluationOperator<T> implements EvaluationOperator<T> {
    private fitnessFunction: (ind: T) => number;

    constructor(fitnessFunction: (ind: T) => number) {
        this.fitnessFunction = fitnessFunction;
    }

    evaluate(individual: T): number {
        return this.fitnessFunction(individual);
    }
}
