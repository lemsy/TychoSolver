import { ElitismOperator } from '../../../core/operators/ElitismOperator';

// Elitism: select top N individuals by fitness
export class ElitismOperatorImpl<T> implements ElitismOperator<T> {
    apply(population: T[], fitnesses: number[], numElites: number): T[] {
        if (numElites <= 0) return [];
        // Pair individuals with fitness and sort descending
        const popWithFitness = population.map((ind, idx) => ({ ind, fit: fitnesses[idx] }));
        popWithFitness.sort((a, b) => b.fit - a.fit);
        return popWithFitness.slice(0, numElites).map(obj => obj.ind);
    }
}
