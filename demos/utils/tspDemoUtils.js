// Utility functions for TSP demo
const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a hard TSP instance: cities on a circle with noise
function createTSPInstance(N, opts = {}) {
    const hard = opts.hard || false;
    const noise = hard ? 0.2 : 0.0;
    const cities = [];
    for (let i = 0; i < N; i++) {
        const angle = (2 * Math.PI * i) / N;
        const r = 100 + (Math.random() - 0.5) * noise * 100;
        cities.push([
            150 + r * Math.cos(angle),
            150 + r * Math.sin(angle)
        ]);
    }
    return {
        cities,
        evaluate: (perm) => {
            let d = 0;
            for (let i = 0; i < perm.length; i++) {
                const a = cities[perm[i]];
                const b = cities[perm[(i + 1) % perm.length]];
                d += Math.hypot(a[0] - b[0], a[1] - b[1]);
            }
            return d;
        }
    };
}

// Plot TSP solution to PNG

function plotTSP(instance, perm, outPath, title = '') {
    const { cities } = instance;
    const canvas = createCanvas(300, 340);
    const ctx = canvas.getContext('2d');
    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 300, 340);
    // Title
    if (title) {
        ctx.fillStyle = '#222';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, 150, 30);
    }
    // Draw tour edges (ensure edges start/end at city centers)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < perm.length; i++) {
        const idxA = perm[i];
        const idxB = perm[(i + 1) % perm.length];
        const [xA, yA] = cities[idxA];
        const [xB, yB] = cities[idxB];
        if (i === 0) ctx.moveTo(xA, yA + 40);
        ctx.lineTo(xB, yB + 40);
    }
    ctx.stroke();
    // Draw cities on top (apply +40 offset to y)
    ctx.fillStyle = '#d00';
    for (const [x, y] of cities) {
        ctx.beginPath();
        ctx.arc(x, y + 40, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    // Save to file
    fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
}

// Neighborhood: all tours by swapping two cities
function tspNeighborhood(tour) {
    const neighbors = [];
    for (let i = 0; i < tour.length - 1; i++) {
        for (let j = i + 1; j < tour.length; j++) {
            const neighbor = tour.slice();
            [neighbor[i], neighbor[j]] = [neighbor[j], neighbor[i]];
            neighbors.push(neighbor);
        }
    }
    return neighbors;
}

// Objective: minimize total tour length
function tspObjective(tour, instance) {
    return instance.evaluate(tour);
}

module.exports = { createTSPInstance, plotTSP, tspNeighborhood, tspObjective };
