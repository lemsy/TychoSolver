// tsp.js
// This script demonstrates solving a hard TSP instance using Parallel Local Search.
// Run this file with: node demos/tsp.js

const { ParallelLocalSearch } = require('../dist/parallel/localsearch/ParallelLocalSearch');
const { createSpainTSPInstance, plotTSP, tspNeighborhood, tspObjective } = require('./utils/tspDemoUtils');
const fs = require('fs');
const path = require('path');

// Use real Spain cities for TSP instance
const tspInstance = createSpainTSPInstance();
const N = tspInstance.cities.length;
// Initial solution: random permutation
const initialSolution = [...Array(N).keys()].sort(() => Math.random() - 0.5);

// Ensure TSP output directory exists (separate from sudoku)
const outputDir = path.join(__dirname, 'output_tsp');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Save initial solution plot (over Spain map)
const initialPlotPath = path.join(outputDir, 'tsp_initial.png');
plotTSP(tspInstance, initialSolution, initialPlotPath, 'Initial TSP (Spain)').then(() => {
    console.log('Initial TSP instance and solution saved to', initialPlotPath);
});

// Run Parallel Local Search (batch of 1 for demo)
const pls = new ParallelLocalSearch();
pls.search(
    [initialSolution],
    (tour) => tspObjective(tour, tspInstance),
    tspNeighborhood,
    { maxIterations: 10000, maximize: false }
).then(async results => {
    const result = results[0];
    // Save solved solution plot (over Spain map)
    const solvedPlotPath = path.join(outputDir, 'tsp_solved.png');
    await plotTSP(tspInstance, result.solution, solvedPlotPath, 'Solved TSP (Spain)');
    console.log('Solved TSP solution saved to', solvedPlotPath);
    console.log('Initial cost:', tspInstance.evaluate(initialSolution));
    console.log('Final cost:', tspInstance.evaluate(result.solution));
}).catch(err => {
    console.error('Error running Parallel Local Search:', err);
});
