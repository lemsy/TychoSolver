import { InitializationOperator } from '../../../core/operators/InitializationOperator';

// GA-specific: initializes a population
export class GAInitializationOperator<T> implements InitializationOperator<T> {
    initialize(config: { populationSize: number; individualFactory: () => T }): T[] {
        const { populationSize, individualFactory } = config;
        return Array.from({ length: populationSize }, individualFactory);
    }
}
