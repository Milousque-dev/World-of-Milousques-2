const BASE_PM = 3;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const GRID_SIZE = 10;
const TILE_SHAPE = [
    0, -TILE_HEIGHT / 2,
    TILE_WIDTH / 2, 0,
    0, TILE_HEIGHT / 2,
    -TILE_WIDTH / 2, 0
];

function grilleVersEcran(grilleX, grilleY) {

    return {

        x: (grilleX - grilleY) * (TILE_WIDTH / 2),
        y: (grilleX + grilleY) * (TILE_HEIGHT / 2)
    };
}

function ecranVersGrille(ecranX, ecranY) {

    return {

        x: Math.round((ecranX / (TILE_WIDTH / 2) + ecranY / (TILE_HEIGHT / 2)) / 2),
        y: Math.round((ecranY / (TILE_HEIGHT / 2) - ecranX / (TILE_WIDTH / 2)) / 2)
    };
}

function getCouleurTile(x, y) {

    return (x + y) % 2 === 0 ? 0x3a7d3a : 0x2d6b2d;
}

function dessinerTile(tile, couleur, strokeColor = 0x1a5c1a) {

    tile.clear();
    tile.poly(TILE_SHAPE);
    tile.fill(couleur);
    tile.stroke({ width: 1, color: strokeColor });
}

function creerPersonnage(couleur) {

    const perso = new PIXI.Graphics();
    perso.rect(-12, -40, 24, 40);
    perso.fill(couleur);

    return perso;
}

async function initApp() {

    const app = new PIXI.Application();

    await app.init({

        width: window.innerWidth,
        height: window.innerHeight,
        background: 0x1a1a2e
    });

    document.body.appendChild(app.canvas);
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;

    return app;
}

function creerGrille(mapContainer) {

    const grille = [];

    for (let gx = 0; gx < GRID_SIZE; gx++) {

        grille[gx] = [];

        for (let gy = 0; gy < GRID_SIZE; gy++) {

            const pos = grilleVersEcran(gx, gy);
            const tile = new PIXI.Graphics();

            dessinerTile(tile, getCouleurTile(gx, gy));
            tile.x = pos.x;
            tile.y = pos.y;
            tile.zIndex = gx + gy;
            mapContainer.addChild(tile);
            grille[gx][gy] = tile;
        }
    }

    return grille;
}

function getCasesAtteignables(startX, startY, pm) {

    const atteignables = [];
    const visited = {};
    const queue = [{ x: startX, y: startY, dist: 0 }];
    visited[`${startX},${startY}`] = true;

    const voisins = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1}
    ];

    while (queue.length > 0) {

        const current = queue.shift();

        if (current.dist >0) {
            atteignables.push({ x: current.x, y: current.y });
        }

        if (current.dist >= pm) continue;

        for (const v of voisins) {

            const nx = current.x + v.dx;
            const ny = current.y + v.dy;
            const key = `${nx},${ny}`;

            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !visited[key]) {

                visited[key] = true;
                queue.push ({ x: nx, y: ny, dist: current.dist + 1 });
            }
        }
    }

    return atteignables;
}

async function init() {

    const app = await initApp();

    const mapContainer = new PIXI.Container();
    mapContainer.sortableChildren = true;
    app.stage.addChild(mapContainer);

    mapContainer.x = window.innerWidth / 2;
    mapContainer.y = window.innerHeight / 2 - (GRID_SIZE - 1) * (TILE_HEIGHT / 2);

    const grille = creerGrille(mapContainer);
    const joueur = creerPersonnage(0x4488ff);
    let joueurGrilleX = 2;
    let joueurGrilleY = 2;

    const posJoueur = grilleVersEcran(joueurGrilleX, joueurGrilleY);
    joueur.x = posJoueur.x;
    joueur.y = posJoueur.y;
    joueur.zIndex = joueurGrilleX + joueurGrilleY + 0.5;
    mapContainer.addChild(joueur);

    let selectedTile = null;
    let selectedOriginalColor = null;

    app.stage.on('pointerdown', (event) => {

        const relX = event.global.x - mapContainer.x;
        const relY = event.global.y - mapContainer.y;
        const cell = ecranVersGrille(relX, relY);

        if (cell.x >= 0 && cell.x < GRID_SIZE && cell.y >= 0 && cell.y < GRID_SIZE) {

            if (selectedTile) {

                dessinerTile(selectedTile, selectedOriginalColor);
            }

            const tile = grille[cell.x][cell.y];

            selectedOriginalColor = getCouleurTile(cell.x, cell.y);
            dessinerTile(tile, 0xffff00, 0xaaaa00);
            selectedTile = tile;

            joueurGrilleX = cell.x;
            joueurGrilleY = cell.y;
            const nouvellePos = grilleVersEcran(joueurGrilleX, joueurGrilleY);
            joueur.x = nouvellePos.x;
            joueur.y = nouvellePos.y;
            joueur.zIndex = joueurGrilleX + joueurGrilleY + 0.5;
        }
    });

    let joueurPM = BASE_PM;
}

init();
