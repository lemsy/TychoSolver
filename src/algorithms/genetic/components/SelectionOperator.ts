import { SelectionOperator } from '../../../core/operators/SelectionOperator';

export class SelectionOperatorImpl<T> implements SelectionOperator<T> {
    // Tournament selection as the default logic
    select(population: T[], fitnesses: number[], numParents: number, tournamentSize: number = 2): T[] {
        const selected: T[] = [];
        for (let i = 0; i < numParents; i++) {
            // Randomly pick tournamentSize individuals
            const indices = Array.from({ length: tournamentSize }, () => Math.floor(Math.random() * population.length));
            let bestIdx = indices[0];
            for (const idx of indices) {
                if (fitnesses[idx] > fitnesses[bestIdx]) {
                    bestIdx = idx;
                }
            }
            selected.push(population[bestIdx]);
        }
        return selected;
    }
}
