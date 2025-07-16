// Utility functions for TSP demo
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const https = require('https');


// Real Spain cities (100 largest by population, with lat/lon)
// Only peninsular cities (exclude islands: Canary, Balearic, Ceuta, Melilla)
const SPAIN_CITIES = [
    // [name, lat, lon]
    ["Madrid", 40.4168, -3.7038],
    ["Barcelona", 41.3874, 2.1686],
    ["Valencia", 39.4699, -0.3763],
    ["Sevilla", 37.3886, -5.9823],
    ["Zaragoza", 41.6488, -0.8891],
    ["Málaga", 36.7213, -4.4214],
    ["Murcia", 37.9847, -1.1285],
    ["Bilbao", 43.2630, -2.9350],
    ["Alicante", 38.3452, -0.4810],
    ["Córdoba", 37.8882, -4.7794],
    ["Valladolid", 41.6523, -4.7245],
    ["Vigo", 42.2406, -8.7207],
    ["Gijón", 43.5322, -5.6611],
    ["L'Hospitalet", 41.3662, 2.1169],
    ["A Coruña", 43.3623, -8.4115],
    ["Vitoria-Gasteiz", 42.8467, -2.6727],
    ["Granada", 37.1773, -3.5986],
    ["Elche", 38.2699, -0.7126],
    ["Oviedo", 43.3619, -5.8494],
    ["Badalona", 41.4500, 2.2474],
    ["Cartagena", 37.6257, -0.9966],
    ["Terrassa", 41.5632, 2.0089],
    ["Jerez", 36.6850, -6.1261],
    ["Sabadell", 41.5463, 2.1086],
    ["Móstoles", 40.3223, -3.8649],
    ["Pamplona", 42.8125, -1.6458],
    ["Almería", 36.8340, -2.4637],
    ["Alcalá de Henares", 40.4818, -3.3641],
    ["Fuenlabrada", 40.2902, -3.8035],
    ["Leganés", 40.3272, -3.7635],
    ["Donostia-San Sebastián", 43.3183, -1.9812],
    ["Getafe", 40.3083, -3.7327],
    ["Burgos", 42.3439, -3.6969],
    ["Albacete", 38.9943, -1.8585],
    ["Santander", 43.4623, -3.8099],
    ["Castellón", 39.9864, -0.0513],
    ["Alcorcón", 40.3458, -3.8249],
    ["Logroño", 42.4627, -2.4449],
    ["Badajoz", 38.8794, -6.9707],
    ["Salamanca", 40.9701, -5.6635],
    ["Huelva", 37.2614, -6.9447],
    ["Marbella", 36.5101, -4.8825],
    ["Lleida", 41.6176, 0.6200],
    ["Tarragona", 41.1189, 1.2445],
    ["León", 42.5987, -5.5671],
    ["Cádiz", 36.5271, -6.2886],
    ["Jaén", 37.7796, -3.7849],
    ["Ourense", 42.3367, -7.8641],
    ["Algeciras", 36.1408, -5.4562],
    ["Reus", 41.1561, 1.1069],
    ["Barakaldo", 43.2976, -2.9915],
    ["Santiago de Compostela", 42.8782, -8.5448],
    ["Lugo", 43.0121, -7.5559],
    ["San Fernando", 36.4667, -6.1994],
    ["Torrevieja", 37.9778, -0.6833],
    ["Parla", 40.2360, -3.7675],
    ["Mataró", 41.5381, 2.4447],
    ["Alcobendas", 40.5373, -3.6373],
    ["Guadalajara", 40.6333, -3.1667],
    ["Toledo", 39.8628, -4.0273],
    ["Girona", 41.9794, 2.8214],
    ["Cáceres", 39.4765, -6.3723],
    ["Ferrol", 43.4832, -8.2366],
    ["Ponferrada", 42.5466, -6.5962],
    ["Ciudad Real", 38.9861, -3.9272],
    ["El Ejido", 36.7766, -2.8145],
    ["Roquetas de Mar", 36.7642, -2.6147],
    ["Rubí", 41.4923, 2.0331],
    ["Majadahonda", 40.4736, -3.8718],
    ["Paterna", 39.5029, -0.4401],
    ["Benidorm", 38.5382, -0.1300],
    ["Valdemoro", 40.1900, -3.6789],
    ["Sant Boi de Llobregat", 41.3436, 2.0366],
    ["Torremolinos", 36.6218, -4.5007],
    ["Mérida", 38.9161, -6.3437],
    ["Sagunto", 39.6792, -0.2733],
    ["Alzira", 39.1500, -0.4333],
    ["Colmenar Viejo", 40.6596, -3.7676],
    ["Cuenca", 40.0704, -2.1374],
    ["Linares", 38.0952, -3.6360],
    ["Molina de Segura", 38.0546, -1.2070],
    ["La Línea de la Concepción", 36.1681, -5.3478],
    ["Sanlúcar de Barrameda", 36.7781, -6.3515],
    ["Chiclana de la Frontera", 36.4192, -6.1494],
    ["Motril", 36.7500, -3.5167],
    ["Granollers", 41.6079, 2.2876],
    ["Puertollano", 38.6872, -4.1078],
    ["Manresa", 41.7269, 1.8266],
    ["Estepona", 36.4276, -5.1459],
    ["Torrelavega", 43.3531, -4.0445],
    ["San Vicente del Raspeig", 38.3965, -0.5257],
    ["Viladecans", 41.3142, 2.0189],
    ["Orihuela", 38.0849, -0.9460],
    ["Portugalete", 43.3208, -3.0206],
    ["Gandía", 38.9680, -0.1819],
    ["Soria", 41.7640, -2.4688],
    ["Rivas-Vaciamadrid", 40.3462, -3.5167],
    ["Cerdanyola del Vallès", 41.4911, 2.1408],
    ["Mollet del Vallès", 41.5407, 2.2116],
    ["Benalmádena", 36.5954, -4.5695],
    ["Ávila", 40.6565, -4.6818],
    ["Pontevedra", 42.4333, -8.6333],
    ["Pozuelo de Alarcón", 40.4323, -3.8134],
    ["Huesca", 42.1401, -0.4089],
    ["Coslada", 40.4262, -3.5618],
    ["Fuengirola", 36.5438, -4.6247],
    ["La Coruña", 43.3623, -8.4115]
];

// Map bounds for Spain (used for coordinate conversion)
const MAP_WIDTH = 600, MAP_HEIGHT = 600, MAP_TOP = 44.2, MAP_BOTTOM = 35.2, MAP_LEFT = -9.5, MAP_RIGHT = 4.5;

// Convert lat/lon to pixel (x, y) for the map image
function latLonToXY(lat, lon) {
    // Linear mapping (approximate, for static map)
    const x = ((lon - MAP_LEFT) / (MAP_RIGHT - MAP_LEFT)) * MAP_WIDTH;
    const y = ((MAP_TOP - lat) / (MAP_TOP - MAP_BOTTOM)) * MAP_HEIGHT;
    return [x, y];
}

// Create a TSP instance using real Spain cities
function createSpainTSPInstance() {
    const cities = SPAIN_CITIES.map(([name, lat, lon]) => latLonToXY(lat, lon));
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

// Compute convex hull using Graham scan (returns array of [x, y])
function convexHull(points) {
    points = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [];
    for (const p of points) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
        lower.push(p);
    }
    const upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
        upper.push(p);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper);
}

// Plot TSP over Spain region outline (convex hull)
async function plotTSP(instance, perm, outPath, title = '') {
    const { cities } = instance;
    const width = 600, height = 600;
    const canvas = createCanvas(width, height + 40);
    const ctx = canvas.getContext('2d');
    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height + 40);
    // Draw Spain region outline (convex hull)
    const hull = convexHull(cities);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(hull[0][0], hull[0][1] + 40);
    for (let i = 1; i < hull.length; i++) {
        ctx.lineTo(hull[i][0], hull[i][1] + 40);
    }
    ctx.closePath();
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
    // Title
    if (title) {
        ctx.fillStyle = '#222';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, 30);
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

module.exports = {
    plotTSP,
    tspNeighborhood,
    tspObjective,
    createSpainTSPInstance,
    SPAIN_CITIES
};
