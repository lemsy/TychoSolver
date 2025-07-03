// ElitismOperator: ensures the best individuals are preserved (optional)
export interface ElitismOperator<T> {
    apply(population: T[], fitnesses: number[], numElites: number): T[];
}
