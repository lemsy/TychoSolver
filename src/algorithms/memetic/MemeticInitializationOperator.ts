import { InitializationOperator } from '../../core/operators/InitializationOperator';

// Per-individual initialization operator for memetic algorithm
export class MemeticInitializationOperator<T> implements InitializationOperator<T> {
    private individualFactory: () => T;

    constructor(individualFactory: () => T) {
        this.individualFactory = individualFactory;
    }

    initialize(config?: { populationSize?: number; individualFactory?: () => T }): T[] {
        const factory = config?.individualFactory || this.individualFactory;
        const size = config?.populationSize || 1;
        return Array.from({ length: size }, factory);
    }
}
