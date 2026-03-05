const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const GRID_SIZE = 10;

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

async function init() {

    const app = new PIXI.Application();

    await app.init({

        width: window.innerWidth,
        height: window.innerHeight,
        background: 0x1a1a2e
    });

    document.body.appendChild(app.canvas);

    const mapContainer = new PIXI.Container();
    app.stage.addChild(mapContainer);
    mapContainer.x = window.innerWidth / 2;
    mapContainer.y = window.innerHeight / 2 - (GRID_SIZE - 1) * (TILE_HEIGHT / 2);

    const grille = [];

    for (let gx = 0; gx < GRID_SIZE; gx++) {

        grille[gx] = [];

        for (let gy = 0; gy < GRID_SIZE; gy++) {

            const pos = grilleVersEcran(gx, gy);

            const couleur = (gx + gy) % 2 === 0 ? 0x3a7d3a : 0x2d6b2d;

            const tile = new PIXI.Graphics();

            tile.poly([

                0, -TILE_HEIGHT / 2,
                TILE_WIDTH / 2, 0,
                0, TILE_HEIGHT / 2,
                -TILE_WIDTH / 2, 0
            ]);

            tile.fill(couleur);
            tile.stroke({ width: 1, color: 0x1a5c1a });
            tile.x = pos.x;
            tile.y = pos.y;

            mapContainer.addChild(tile);
            grille[gx][gy] = tile;
        }
    }
}

init();