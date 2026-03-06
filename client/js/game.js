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

            mapContainer.addChild(tile);
            grille[gx][gy] = tile;
        }
    }

    return grille;
}

async function init() {

    const app = await initApp();

    const mapContainer = new PIXI.Container();
    app.stage.addChild(mapContainer);
    mapContainer.x = window.innerWidth / 2;
    mapContainer.y = window.innerHeight / 2 - (GRID_SIZE - 1) * (TILE_HEIGHT / 2);

    const grille = creerGrille(mapContainer);

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
        }
    });
}

init();
