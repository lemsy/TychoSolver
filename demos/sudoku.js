// sudoku.js
// This script demonstrates solving a 9x9 Sudoku puzzle using the compiled metaheuristic solver.
// Run this file with: node demos/sudoku.js

// Import the compiled MemeticAlgorithm and required operators
const { MemeticAlgorithm } = require('../dist/algorithms/memetic');
const { GAEvaluationOperator } = require('../dist/algorithms/genetic/components/EvaluationOperator');
const { SelectionOperatorImpl } = require('../dist/algorithms/genetic/components/SelectionOperator');
const { CrossoverOperatorImpl } = require('../dist/algorithms/genetic/components/CrossoverOperator');
const { MutationOperatorImpl } = require('../dist/algorithms/genetic/components/MutationOperator');
const { MemeticInitializationOperator } = require('../dist/algorithms/memetic/components/MemeticInitializationOperator');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Example 9x9 Sudoku puzzle (0 = empty cell)
const initialGrid = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
];
const SIZE = 9;
const SUBGRID = 3;

// Helper to deep copy a grid
function copyGrid(grid) {
    return grid.map(row => [...row]);
}

// Individual factory: fill empty cells randomly (1-9)
function sudokuIndividualFactory() {
    const grid = copyGrid(initialGrid);
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i][j] === 0) {
                grid[i][j] = Math.floor(Math.random() * SIZE) + 1;
            }
        }
    }
    return grid;
}

// Fitness: count number of non-conflicting cells (max = SIZE*SIZE*3)
function sudokuFitness(grid) {
    let score = 0;
    // Rows
    for (let i = 0; i < SIZE; i++) {
        const seen = new Set();
        for (let j = 0; j < SIZE; j++) seen.add(grid[i][j]);
        score += seen.size;
    }
    // Columns
    for (let j = 0; j < SIZE; j++) {
        const seen = new Set();
        for (let i = 0; i < SIZE; i++) seen.add(grid[i][j]);
        score += seen.size;
    }
    // Subgrids
    for (let bi = 0; bi < SIZE; bi += SUBGRID) {
        for (let bj = 0; bj < SIZE; bj += SUBGRID) {
            const seen = new Set();
            for (let i = 0; i < SUBGRID; i++) {
                for (let j = 0; j < SUBGRID; j++) {
                    seen.add(grid[bi + i][bj + j]);
                }
            }
            score += seen.size;
        }
    }
    return score;
}

// Neighborhood: change one cell (not a clue) to a random value
function sudokuNeighborhood(grid) {
    const neighbors = [];
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (initialGrid[i][j] === 0) {
                for (let v = 1; v <= SIZE; v++) {
                    if (grid[i][j] !== v) {
                        const neighbor = copyGrid(grid);
                        neighbor[i][j] = v;
                        neighbors.push(neighbor);
                    }
                }
            }
        }
    }
    return neighbors;
}

// Operators
const initializationOperator = new MemeticInitializationOperator(sudokuIndividualFactory);
const evaluationOperator = new GAEvaluationOperator(sudokuFitness);
const selectionOperator = new SelectionOperatorImpl();
const crossoverOperator = new CrossoverOperatorImpl();
const mutationOperator = new MutationOperatorImpl(row => row.map(cell => Math.floor(Math.random() * SIZE) + 1));

// Ensure output directory exists
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

function drawSudokuGrid(grid, filename, title = '') {
    const cellSize = 50;
    const gridSize = SIZE * cellSize;
    const canvas = createCanvas(gridSize, gridSize + 40);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, gridSize, gridSize + 40);

    // Title
    ctx.fillStyle = '#222';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, gridSize / 2, 30);

    // Draw cells
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const x = j * cellSize;
            const y = i * cellSize + 40;
            ctx.strokeStyle = '#bbb';
            ctx.strokeRect(x, y, cellSize, cellSize);
            if (initialGrid[i][j] !== 0) {
                ctx.fillStyle = '#1976d2'; // Clue color
            } else {
                ctx.fillStyle = '#222';
            }
            ctx.fillText(grid[i][j] || '', x + cellSize / 2, y + cellSize / 2);
        }
    }
    // Draw bold lines for subgrids
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    for (let i = 0; i <= SIZE; i++) {
        if (i % SUBGRID === 0) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize + 40);
            ctx.lineTo(gridSize, i * cellSize + 40);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 40);
            ctx.lineTo(i * cellSize, gridSize + 40);
            ctx.stroke();
        }
    }
    ctx.lineWidth = 1;
    // Save image
    const out = fs.createWriteStream(path.join(outputDir, filename));
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log(`Saved image: ${filename}`));
}

// Configure and run the algorithm
async function runSudokuDemo() {
    // Save initial grid image
    drawSudokuGrid(initialGrid, 'sudoku_initial.png', 'Initial Sudoku');
    const algo = new MemeticAlgorithm({
        populationSize: 100,
        generations: 100,
        crossoverRate: 0.7,
        mutationRate: 0.2,
        localSearchRate: 0.3,
        initializationOperator,
        evaluationOperator,
        selectionOperator,
        crossoverOperator,
        mutationOperator,
        individualFactory: sudokuIndividualFactory,
        objectiveFunction: sudokuFitness,
        neighborhoodFunction: sudokuNeighborhood,
        localSearchOptions: {
            maxIterations: 5,
            maximize: true
        }
    });
    const result = await algo.evolve();
    // Save solved grid image
    drawSudokuGrid(result.genome, 'sudoku_solved.png', 'Solved Sudoku');
    console.log('Solved Sudoku:');
    printSudoku(result.genome);
    console.log('Fitness:', sudokuFitness(result.genome));
}

function printSudoku(grid) {
    grid.forEach(row => {
        console.log(row.join(' '));
    });
}

runSudokuDemo();

// Note: To use this feature, install canvas with: npm install canvas
