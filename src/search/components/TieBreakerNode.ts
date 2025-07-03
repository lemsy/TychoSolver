export const TieBreakerNode = ({
    currentSolution,
    neighbor,
    currentCost,
    neighborCost,
    maximizeCost,
    children
}: {
    currentSolution: any;
    neighbor: any;
    currentCost: number;
    neighborCost: number;
    maximizeCost?: boolean;
    children: (isCostImprovement: boolean) => any;
}) => {
    const isCostImprovement = (maximizeCost ?? false)
        ? neighborCost > currentCost
        : neighborCost < currentCost;
    return children(isCostImprovement);
};
