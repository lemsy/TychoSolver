import { TerminationOperator as ITerminationOperator } from '../../core/operators/TerminationOperator';
import { LocalSearchOptions } from '../types';

export class LSTerminationOperator implements ITerminationOperator<any> {
    shouldTerminate(state: { solution: any; fitness: number; options: LocalSearchOptions<any>; iterations?: number }): boolean {
        const { fitness, options, iterations = 0 } = state;
        const maxIterations = options.maxIterations ?? 1000;
        const fitnessLimit = options.fitnessLimit;
        if (iterations >= maxIterations) {
            return true;
        }
        if (typeof fitnessLimit === 'number') {
            if ((options.maximize && fitness >= fitnessLimit) || (!options.maximize && fitness <= fitnessLimit)) {
                return true;
            }
        }
        return false;
    }
}
