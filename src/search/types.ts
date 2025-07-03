export interface ObjectiveFunction<T> {
    (solution: T): number | Promise<number>;
}

export interface CostFunction<T> {
    (solution: T): number | Promise<number>;
}

export interface NeighborhoodFunction<T> {
    (solution: T): T[];
}

export interface LocalSearchOptions<T = any> {
    maxIterations?: number;
    maximize?: boolean;
    randomRestarts?: number;
    randomInitializer?: () => T;
    onClimb?: (solution: T, fitness: number, iteration: number) => Promise<void>;
    costFunction?: CostFunction<T>;
    maximizeCost?: boolean;
    dynamicNeighborhoodFunction?: NeighborhoodFunction<T>;
    fitnessLimit?: number;
}

export interface LocalSearchResult<T> {
    solution: T;
    fitness: number;
    iterations: number;
}
