import { InitializationOperator as IInitializationOperator } from '../../core/operators/InitializationOperator';
import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions } from '../types';

export class LSInitializationOperator implements IInitializationOperator<any> {
    async initialize(config: {
        initialSolution: any;
        randomInitializer?: () => any;
        objectiveFunction: ObjectiveFunction<any>;
        neighborhoodFunction: NeighborhoodFunction<any>;
        options: LocalSearchOptions<any>;
        evaluationOperator: { evaluate: (solution: any) => Promise<number> };
        neighborhoodOperator: (args: any) => Promise<any>;
        terminationOperator: { shouldTerminate: (state: any) => boolean };
    }): Promise<{ solution: any; fitness: number; iterations: number }> {
        const { initialSolution, randomInitializer, objectiveFunction, neighborhoodFunction, options, evaluationOperator, neighborhoodOperator, terminationOperator } = config;
        const solution = randomInitializer ? randomInitializer() : initialSolution;
        const fitness = await objectiveFunction(solution);
        // Start the search loop with modular operators
        const { solution: finalSolution, fitness: finalFitness, iterations } = await import('./SearchLoopOperator').then(m => m.SearchLoopOperator({
            currentSolution: solution,
            currentFitness: fitness,
            objectiveFunction,
            neighborhoodFunction,
            options,
            iterations: 0,
            evaluationOperator,
            neighborhoodOperator,
            terminationOperator
        }));
        return { solution: finalSolution, fitness: finalFitness, iterations };
    }
}
