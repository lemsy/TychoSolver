import { TerminationOperator } from '../../../core/operators/TerminationOperator';

// GA-specific: terminates after max generations or fitness threshold
export class GATerminationOperator<T> implements TerminationOperator<T> {
    shouldTerminate(state: { generation?: number; fitness?: number; maxGenerations?: number; fitnessLimit?: number }): boolean {
        const { generation = 0, fitness, maxGenerations, fitnessLimit } = state;
        if (typeof maxGenerations === 'number' && generation >= maxGenerations) return true;
        if (typeof fitnessLimit === 'number' && typeof fitness === 'number' && fitness >= fitnessLimit) return true;
        return false;
    }
}
