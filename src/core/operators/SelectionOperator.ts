// SelectionOperator: selects parents from the population for reproduction
export interface SelectionOperator<T> {
    select(population: T[], fitnesses: number[], numParents: number): T[];
}
