// Generic evaluation operator interface for both LS and GA
export interface EvaluationOperator<T> {
    evaluate(solution: T): number | Promise<number>;
}
