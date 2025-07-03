// CrossoverOperator: combines two parents to produce offspring
export interface CrossoverOperator<T> {
    crossover(parent1: T, parent2: T): [T, T];
}
