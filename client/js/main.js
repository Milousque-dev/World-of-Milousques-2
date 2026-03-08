import { GRID_SIZE, TILE_HEIGHT } from './constants.js';
import { creerGrille } from './rendering/grid.js';
import { Player } from './entities/player.js';
import { Enemy } from './entities/enemy.js';
import { HUD } from './ui/hud.js';
import { CombatSystem } from './systems/combat.js';
import { InputSystem } from './systems/input.js';

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

function creerMapContainer(app) {
    const mapContainer = new PIXI.Container();
    mapContainer.sortableChildren = true;
    app.stage.addChild(mapContainer);
    mapContainer.x = window.innerWidth / 2;
    mapContainer.y = window.innerHeight / 2 - (GRID_SIZE - 1) * (TILE_HEIGHT / 2);
    return mapContainer;
}

async function init() {
    const app = await initApp();
    const mapContainer = creerMapContainer(app);
    const grille = creerGrille(mapContainer);

    const player = new Player(2, 2, mapContainer);
    const ennemi1 = new Enemy(7, 7, mapContainer);

    const hud = new HUD(app);

    const combatSystem = new CombatSystem(player, [ennemi1], grille, hud);
    const inputSystem = new InputSystem(app, mapContainer, combatSystem);

    combatSystem.init();
    inputSystem.init();

    app.ticker.add(() => {
        combatSystem.update();
    });
}

init();