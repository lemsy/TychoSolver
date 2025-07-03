export const OnClimbNode = async ({
    solution,
    fitness,
    iteration,
    onClimb,
    children
}: {
    solution: any;
    fitness: number;
    iteration: number;
    onClimb?: (solution: any, fitness: number, iteration: number) => Promise<void>;
    children: () => any;
}) => {
    if (onClimb) {
        await onClimb(solution, fitness, iteration);
    }
    return children();
};
