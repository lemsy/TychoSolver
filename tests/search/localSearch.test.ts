import { LocalSearch, ObjectiveFunction, NeighborhoodFunction } from '../../src/search/localSearch';

describe('LocalSearch', () => {
  // Test case: Simple 1D optimization problem (finding maximum)
  it('should find local maximum in 1D function', () => {
    // Simple hill with a peak at x=10
    const objectiveFunction: ObjectiveFunction<number> = (x: number) => {
      return -(x - 10) * (x - 10) + 100; // Parabola with maximum at x=10
    };
    
    // Generate neighbors that are +/-1 from current solution
    const neighborhoodFunction: NeighborhoodFunction<number> = (x: number) => {
      return [x - 1, x + 1];
    };
    
    const localSearch = new LocalSearch<number>();
    const result = localSearch.search(0, objectiveFunction, neighborhoodFunction);
    
    expect(result.solution).toBe(10);
    expect(result.fitness).toBe(100);
    expect(result.iterations).toBeLessThan(20); // Should find solution in fewer iterations
  });
  
  // Test case: Finding minimum value
  it('should find local minimum when minimize option is used', () => {
    // Simple function with minimum at x=5
    const objectiveFunction: ObjectiveFunction<number> = (x: number) => {
      return (x - 5) * (x - 5); // Parabola with minimum at x=5
    };
    
    // Generate neighbors that are +/-1 from current solution
    const neighborhoodFunction: NeighborhoodFunction<number> = (x: number) => {
      return [x - 1, x + 1];
    };
    
    const localSearch = new LocalSearch<number>();
    const result = localSearch.search(0, objectiveFunction, neighborhoodFunction, { 
      maximize: false 
    });
    
    expect(result.solution).toBe(5);
    expect(result.fitness).toBe(0);
  });
  
  // Test case: More complex example with array-based solutions
  it('should optimize an array-based representation', () => {
    // Try to maximize the sum of elements
    const objectiveFunction: ObjectiveFunction<number[]> = (arr: number[]) => {
      return arr.reduce((sum, val) => sum + val, 0);
    };
    
    // Neighborhood: flip one element between 0 and 1
    const neighborhoodFunction: NeighborhoodFunction<number[]> = (arr: number[]) => {
      const neighbors: number[][] = [];
      
      for (let i = 0; i < arr.length; i++) {
        const neighbor = [...arr];
        neighbor[i] = neighbor[i] === 0 ? 1 : 0;
        neighbors.push(neighbor);
      }
      
      return neighbors;
    };
    
    const localSearch = new LocalSearch<number[]>();
    const initialSolution = [0, 0, 0, 0, 0]; // Start with all zeros
    
    const result = localSearch.search(initialSolution, objectiveFunction, neighborhoodFunction);
    
    // Since we're maximizing the sum, all elements should be 1
    expect(result.solution).toEqual([1, 1, 1, 1, 1]);
    expect(result.fitness).toBe(5);
  });
  
  // Test max iterations
  it('should respect maxIterations parameter', () => {
    const objectiveFunction = jest.fn((x: number) => x);
    const neighborhoodFunction = jest.fn((x: number) => [x + 1]);
    
    const localSearch = new LocalSearch<number>();
    const result = localSearch.search(0, objectiveFunction, neighborhoodFunction, {
      maxIterations: 5
    });
    
    expect(result.iterations).toBeLessThanOrEqual(5);
  });
});
