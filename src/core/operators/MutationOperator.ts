// MutationOperator: applies mutation to an individual
export interface MutationOperator<T> {
    mutate(individual: T): T;
}
