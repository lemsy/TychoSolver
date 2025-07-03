// ReplacementOperator: selects survivors for the next generation
export interface ReplacementOperator<T> {
    replace(oldPopulation: T[], offspring: T[], fitnesses: number[]): T[];
}
