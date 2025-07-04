// src/core/operators/PopulationOperator.ts

import type { InitializationOperator } from './InitializationOperator';
import type { EvaluationOperator } from './EvaluationOperator';

/**
 * Interface for a component that creates and evaluates a population.
 * Can be used by both Genetic and Memetic algorithms.
 */
export interface PopulationOperator<T> {
    /**
     * Creates and evaluates a population.
     * @param config Algorithm configuration object
     * @param initializationOperator Operator to create individuals
     * @param evaluationOperator Operator to evaluate individuals
     * @returns Promise of an array of individuals
     */
    populate(
        config: any,
        initializationOperator: InitializationOperator<T>,
        evaluationOperator: EvaluationOperator<T>
    ): Promise<T[]>;
}
