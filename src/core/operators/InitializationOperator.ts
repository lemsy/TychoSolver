// Generic initialization operator interface for both LS and GA
export interface InitializationOperator<T> {
    initialize(config?: any): T | T[];
}
