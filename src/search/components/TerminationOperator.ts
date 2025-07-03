import { LocalSearchOptions } from '../types';

export const TerminationOperator = ({
    solution,
    fitness,
    options,
    iterations = 0
}: {
    solution: any;
    fitness: number;
    options: LocalSearchOptions<any>;
    iterations?: number;
}) => {
    const maxIterations = options.maxIterations ?? 1000;
    const fitnessLimit = options.fitnessLimit;
    // Check for termination
    if (iterations >= maxIterations) {
        return { terminated: true, solution, fitness, iterations };
    }
    if (typeof fitnessLimit === 'number') {
        if ((options.maximize && fitness >= fitnessLimit) || (!options.maximize && fitness <= fitnessLimit)) {
            return { terminated: true, solution, fitness, iterations };
        }
    }
    // Not terminated
    return { terminated: false, solution, fitness, iterations };
};
