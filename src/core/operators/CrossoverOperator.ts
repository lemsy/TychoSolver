// CrossoverOperator: combines two parents to produce offspring
// Return an array of offspring (commonly two children). Using `T[]` is more flexible
// and accepts both tuple-style and plain-array implementations.
export interface CrossoverOperator<T> {
    crossover(parent1: T, parent2: T): T[] | Promise<T[]>;
}
