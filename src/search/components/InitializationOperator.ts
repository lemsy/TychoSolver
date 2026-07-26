import { InitializationOperator as IInitializationOperator } from '../../core/operators/InitializationOperator';
import { ObjectiveFunction, NeighborhoodFunction, LocalSearchOptions } from '../types';

export class LSInitializationOperator implements IInitializationOperator<any> {
    async initialize(config: {
        initialSolution: any;
        randomInitializer?: () => any;
        objectiveFunction: ObjectiveFunction<any>;
        neighborhoodFunction?: NeighborhoodFunction<any> | null;
        options: LocalSearchOptions<any>;
        evaluationOperator: { evaluate: (solution: any) => Promise<number> };
        neighborhoodOperator: (args: any) => Promise<any>;
        terminationOperator: { shouldTerminate: (state: any) => boolean };
    }): Promise<{ solution: any; fitness: number; iterations: number }> {
        const {
            initialSolution,
            randomInitializer,
            objectiveFunction,
            neighborhoodFunction,
            options,
            evaluationOperator,
            neighborhoodOperator,
            terminationOperator
        } = config;

        const solution = randomInitializer ? randomInitializer() : initialSolution;
        const fitness = await objectiveFunction(solution);

        const args: {
            currentSolution: any;
            currentFitness: number;
            objectiveFunction: ObjectiveFunction<any>;
            neighborhoodFunction?: NeighborhoodFunction<any> | null;
            options: LocalSearchOptions<any>;
            iterations: number;
            evaluationOperator: { evaluate: (solution: any) => Promise<number> };
            neighborhoodOperator: (args: any) => Promise<any>;
            terminationOperator: { shouldTerminate: (state: any) => boolean };
        } = {
            currentSolution: solution,
            currentFitness: fitness,
            objectiveFunction,
            options,
            iterations: 0,
            evaluationOperator,
            neighborhoodOperator,
            terminationOperator
        };

        if (neighborhoodFunction !== undefined) {
            args.neighborhoodFunction = neighborhoodFunction;
        }

        const {
            solution: finalSolution,
            fitness: finalFitness,
            iterations
        } = await import('./SearchLoopOperator').then(m =>
            m.SearchLoopOperator(args)
        );

        return {
            solution: finalSolution,
            fitness: finalFitness,
            iterations
        };
    }
}