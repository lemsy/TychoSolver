// Generic initialization operator interface for both LS and GA
// Allow the operator to specify its return type (e.g. a single solution, a population array,
// or a more complex async result). The second generic parameter `R` defaults to `T | T[]`
// to preserve backward compatibility for existing implementations.
export interface InitializationOperator<T, R = T | T[]> {
    initialize(config?: any): R | Promise<R>;
}
