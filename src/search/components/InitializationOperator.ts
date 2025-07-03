import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions } from '../types';

export const InitializationOperator = async ({
    initialSolution,
    randomInitializer,
    objectiveFunction,
    neighborhoodFunction,
    options
}: {
    initialSolution: any;
    randomInitializer?: () => any;
    objectiveFunction: ObjectiveFunction<any>;
    neighborhoodFunction: NeighborhoodFunction<any>;
    options: LocalSearchOptions<any>;
}) => {
    const solution = randomInitializer ? randomInitializer() : initialSolution;
    const fitness = await objectiveFunction(solution);
    // Start the search loop
    const { solution: finalSolution, fitness: finalFitness, iterations } = await import('./SearchLoopOperator').then(m => m.SearchLoopOperator({
        currentSolution: solution,
        currentFitness: fitness,
        objectiveFunction,
        neighborhoodFunction,
        options,
        iterations: 0
    }));
    return { solution: finalSolution, fitness: finalFitness, iterations };
};
