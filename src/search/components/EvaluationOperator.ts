import { EvaluationOperator as IEvaluationOperator } from '../../core/operators/EvaluationOperator';
import { ObjectiveFunction } from '../types';

export class LSEvaluationOperator implements IEvaluationOperator<any> {
    constructor(private objectiveFunction: ObjectiveFunction<any>) { }

    async evaluate(solution: any): Promise<number> {
        return this.objectiveFunction(solution);
    }
}
