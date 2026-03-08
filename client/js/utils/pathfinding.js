import { GRID_SIZE, DIRECTIONS } from '../constants.js';

function calculerDistanceManhattan(ax, ay, bx, by) {
    return Math.abs(ax - bx) + Math.abs(ay - by);
}

function estDansGrille(x, y) {
    return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
}

export function getCasesAtteignables(startX, startY, pm) {
    const atteignables = [];
    const visited = {};
    const queue = [{ x: startX, y: startY, dist: 0 }];
    visited[`${startX},${startY}`] = true;

    while (queue.length > 0) {
        const current = queue.shift();

        if (current.dist > 0) {
            atteignables.push({ x: current.x, y: current.y });
        }

        if (current.dist >= pm) continue;

        for (const v of DIRECTIONS) {
            const nx = current.x + v.dx;
            const ny = current.y + v.dy;
            const key = `${nx},${ny}`;

            if (estDansGrille(nx, ny) && !visited[key]) {
                visited[key] = true;
                queue.push({ x: nx, y: ny, dist: current.dist + 1 });
            }
        }
    }

    return atteignables;
}

export function trouverChemin(startX, startY, endX, endY) {
    const openSet = [{
        x: startX,
        y: startY,
        g: 0,
        f: calculerDistanceManhattan(startX, startY, endX, endY),
        parent: null
    }];
    const closedSet = {};

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();
        const key = `${current.x},${current.y}`;

        if (current.x === endX && current.y === endY) {
            return reconstruireChemin(current);
        }

        closedSet[key] = true;

        for (const v of DIRECTIONS) {
            const nx = current.x + v.dx;
            const ny = current.y + v.dy;
            const nKey = `${nx},${ny}`;

            if (!estDansGrille(nx, ny) || closedSet[nKey]) continue;

            const g = current.g + 1;
            const f = g + calculerDistanceManhattan(nx, ny, endX, endY);

            const existant = openSet.find(n => n.x === nx && n.y === ny);
            if (existant && existant.g <= g) continue;

            if (existant) {
                openSet.splice(openSet.indexOf(existant), 1);
            }

            openSet.push({ x: nx, y: ny, g, f, parent: current });
        }
    }

    return null;
}

function reconstruireChemin(node) {
    const chemin = [];
    let current = node;
    while (current) {
        chemin.unshift({ x: current.x, y: current.y });
        current = current.parent;
    }
    return chemin;
}
