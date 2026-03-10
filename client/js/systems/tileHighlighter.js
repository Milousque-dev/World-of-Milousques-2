import { COUT_PA_ATTAQUE, COULEUR_TILE_ATTAQUE, COULEUR_STROKE_ATTAQUE } from '../constants.js';
import { getCasesAtteignables } from '../utils/pathfinding.js';
import { dessinerTile, getCouleurTile } from '../rendering/tile.js';

export class TileHighlighter {

    constructor(grille) {

        this.grille = grille;
        this.tilesAtteignables = [];
        this.tilesAttaque = [];
    }

    afficherCasesAtteignables(combattant, getCombattantSurCase) {

        this.effacerCasesAtteignables();

        const cases = getCasesAtteignables(combattant.grilleX, combattant.grilleY, combattant.pm);

        for (const c of cases) {

            if (getCombattantSurCase(c.x, c.y)) continue;
            const tile = this.grille[c.x][c.y];
            dessinerTile(tile, 0x4444aa, 0x3333aa);
            this.tilesAtteignables.push({ x: c.x, y: c.y });
        }
    }

    afficherCasesAttaque(combattant, ennemis) {

        this.effacerCasesAttaque();

        for (const ennemi of ennemis) {

            if (ennemi.estMort()) continue;

            if (combattant.estAPortee(ennemi, combattant.porteeAttaque) && combattant.pa >= COUT_PA_ATTAQUE) {
                const tile = this.grille[ennemi.grilleX][ennemi.grilleY];
                dessinerTile(tile, COULEUR_TILE_ATTAQUE, COULEUR_STROKE_ATTAQUE);
                this.tilesAttaque.push({ x: ennemi.grilleX, y: ennemi.grilleY });
            }
        }
    }

    effacerCasesAtteignables() {

        for (const c of this.tilesAtteignables) {

            dessinerTile(this.grille[c.x][c.y], getCouleurTile(c.x, c.y));
        }

        this.tilesAtteignables = [];
    }

    effacerCasesAttaque() {

        for (const c of this.tilesAttaque) {

            dessinerTile(this.grille[c.x][c.y], getCouleurTile(c.x, c.y));
        }

        this.tilesAttaque = [];
    }

    effacerTout() {

        this.effacerCasesAtteignables();
        this.effacerCasesAttaque();
    }

    estCaseAtteignable(x, y) {

        return this.tilesAtteignables.some(c => c.x === x && c.y === y);
    }

    estCaseAttaque(x, y) {
        
        return this.tilesAttaque.some(c => c.x === x && c.y === y);
    }
}
