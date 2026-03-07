import { GRID_SIZE } from '../constants.js';
import { ecranVersGrille } from '../utils/coordinates.js';

export class InputSystem {
    constructor(app, mapContainer, combatSystem) {
        this.app = app;
        this.mapContainer = mapContainer;
        this.combatSystem = combatSystem;
    }

    init() {
        this.app.stage.on('pointerdown', (event) => {
            const cell = this.getCellFromEvent(event);
            if (!this.estCelluleValide(cell)) return;
            this.combatSystem.handleClick(cell.x, cell.y);
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') {
                this.combatSystem.finTourJoueur();
            }
        });
    }

    getCellFromEvent(event) {
        const relX = event.global.x - this.mapContainer.x;
        const relY = event.global.y - this.mapContainer.y;
        return ecranVersGrille(relX, relY);
    }

    estCelluleValide(cell) {
        return cell.x >= 0 && cell.x < GRID_SIZE && cell.y >= 0 && cell.y < GRID_SIZE;
    }
}
