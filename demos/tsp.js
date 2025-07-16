// tsp.js
// This script demonstrates solving a hard TSP instance using Parallel Local Search.
// Run this file with: node demos/tsp.js

const { ParallelLocalSearch } = require('../dist/parallel/localsearch/ParallelLocalSearch');
const { createTSPInstance, plotTSP, tspNeighborhood, tspObjective } = require('./utils/tspDemoUtils');
const fs = require('fs');
const path = require('path');

// Generate a "hard" TSP instance (e.g., 100 cities in a circle with noise)
const N = 100;
const tspInstance = createTSPInstance(N, { hard: true });

// Initial solution: random permutation
const initialSolution = [...Array(N).keys()].sort(() => Math.random() - 0.5);

// Ensure TSP output directory exists (separate from sudoku)
const outputDir = path.join(__dirname, 'output_tsp');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Save initial solution plot
const initialPlotPath = path.join(outputDir, 'tsp_initial.png');
plotTSP(tspInstance, initialSolution, initialPlotPath, 'Initial TSP');
console.log('Initial TSP instance and solution saved to', initialPlotPath);

// Run Parallel Local Search (batch of 1 for demo)
const pls = new ParallelLocalSearch();
pls.search(
    [initialSolution],
    (tour) => tspObjective(tour, tspInstance),
    tspNeighborhood,
    { maxIterations: 10000, maximize: false }
).then(results => {
    const result = results[0];
    // Save solved solution plot
    const solvedPlotPath = path.join(outputDir, 'tsp_solved.png');
    plotTSP(tspInstance, result.solution, solvedPlotPath, 'Solved TSP');
    console.log('Solved TSP solution saved to', solvedPlotPath);
    console.log('Initial cost:', tspInstance.evaluate(initialSolution));
    console.log('Final cost:', tspInstance.evaluate(result.solution));
}).catch(err => {
    console.error('Error running Parallel Local Search:', err);
});
