import { GRID_SIZE, TILE_HEIGHT } from './constants.js';
import { creerGrille } from './rendering/grid.js';
import { Player } from './entities/player.js';
import { Enemy } from './entities/enemy.js';
import { HUD } from './ui/hud.js';
import { CombatSystem } from './systems/combat.js';
import { InputSystem } from './systems/input.js';

// crée un canvas plein écran avec un fond sombre
// prêt à recevoir des éléments graphiques et des interactions souris
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

// crée un conteneur centré à l'écran avec tri par profondeur
// prêt à accueillir la grille isométrique
function creerMapContainer(app) {
    const mapContainer = new PIXI.Container();
    mapContainer.sortableChildren = true;
    app.stage.addChild(mapContainer);
    mapContainer.x = window.innerWidth / 2;
    mapContainer.y = window.innerHeight / 2 - (GRID_SIZE - 1) * (TILE_HEIGHT / 2);
    return mapContainer;
}

// point d'entrée du jeu
// crée la scène, les personnages, le HUD, les systèmes, puis lance la game loop
async function init() {
    // crée l'app PixiJS, le conteneur de la map, puis génère la grille isométrique
    const app = await initApp();
    const mapContainer = creerMapContainer(app);
    const grille = creerGrille(mapContainer);

    // crée les entités
    const player = new Player(2, 2, mapContainer);
    const ennemi1 = new Enemy(7, 7, mapContainer);

    // HUD
    const hud = new HUD(app);

    // système
    const combatSystem = new CombatSystem(player, [ennemi1], grille, hud);
    const inputSystem = new InputSystem(app, mapContainer, combatSystem);

    // initialise
    combatSystem.init();
    inputSystem.init();

    // boucle du jeu
    app.ticker.add(() => {
        combatSystem.update();
    });
}

init();