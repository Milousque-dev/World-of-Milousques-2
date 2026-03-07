import { VITESSE, COULEUR_TILE_ATTEIGNABLE, COULEUR_STROKE_ATTEIGNABLE } from '../constants.js';
import { getCasesAtteignables, trouverChemin } from '../utils/pathfinding.js';
import { grilleVersEcran } from '../utils/coordinates.js';
import { dessinerTile, getCouleurTile } from '../rendering/tile.js';

/**
 * Système de gestion du déplacement du joueur
 */
export class MovementSystem {
    constructor(player, grille, hud) {
        this.player = player;
        this.grille = grille;
        this.hud = hud;

        // État du mouvement
        this.cheminActuel = null;
        this.etapeChemin = 0;
        this.enDeplacement = false;
        this.progression = 0;

        // Cases illuminées
        this.tilesIlluminees = [];
    }

    /**
     * Initialise l'affichage des cases atteignables
     */
    init() {
        this.afficherCasesAtteignables();
    }

    /**
     * Affiche les cases atteignables en bleu
     */
    afficherCasesAtteignables() {
        this.effacerCasesAtteignables();
        const cases = getCasesAtteignables(this.player.grilleX, this.player.grilleY, this.player.getPM());

        for (const c of cases) {
            const tile = this.grille[c.x][c.y];
            dessinerTile(tile, COULEUR_TILE_ATTEIGNABLE, COULEUR_STROKE_ATTEIGNABLE);
            this.tilesIlluminees.push({ x: c.x, y: c.y });
        }

        this.hud.updatePM();
    }

    /**
     * Efface l'affichage des cases atteignables
     */
    effacerCasesAtteignables() {
        for (const c of this.tilesIlluminees) {
            const tile = this.grille[c.x][c.y];
            dessinerTile(tile, getCouleurTile(c.x, c.y));
        }
        this.tilesIlluminees = [];
    }

    /**
     * Vérifie si une case est atteignable
     */
    estCaseAtteignable(x, y) {
        return this.tilesIlluminees.some(c => c.x === x && c.y === y);
    }

    /**
     * Démarre un déplacement vers une destination
     */
    deplacerVers(destinationX, destinationY) {
        if (this.enDeplacement) return false;
        if (!this.estCaseAtteignable(destinationX, destinationY)) return false;

        const chemin = trouverChemin(
            this.player.grilleX,
            this.player.grilleY,
            destinationX,
            destinationY
        );

        if (!chemin || chemin.length < 2) return false;

        this.player.depensePM(chemin.length - 1);
        this.effacerCasesAtteignables();

        this.cheminActuel = chemin;
        this.etapeChemin = 0;
        this.progression = 0;
        this.enDeplacement = true;

        return true;
    }

    /**
     * Met à jour l'animation du déplacement
     */
    update() {
        if (!this.enDeplacement || !this.cheminActuel) return;

        this.progression += VITESSE;

        if (this.progression >= 1) {
            this.progresserEtape();
        } else {
            this.interpolerPosition();
        }
    }

    /**
     * Passe à l'étape suivante du chemin
     */
    progresserEtape() {
        this.progression = 0;
        this.etapeChemin++;

        this.player.setPosition(
            this.cheminActuel[this.etapeChemin].x,
            this.cheminActuel[this.etapeChemin].y
        );

        if (this.etapeChemin >= this.cheminActuel.length - 1) {
            this.terminerDeplacement();
        }
    }

    /**
     * Interpole la position entre deux étapes
     */
    interpolerPosition() {
        const from = grilleVersEcran(
            this.cheminActuel[this.etapeChemin].x,
            this.cheminActuel[this.etapeChemin].y
        );
        const to = grilleVersEcran(
            this.cheminActuel[this.etapeChemin + 1].x,
            this.cheminActuel[this.etapeChemin + 1].y
        );

        const x = from.x + (to.x - from.x) * this.progression;
        const y = from.y + (to.y - from.y) * this.progression;

        const fromZ = this.cheminActuel[this.etapeChemin].x + this.cheminActuel[this.etapeChemin].y;
        const toZ = this.cheminActuel[this.etapeChemin + 1].x + this.cheminActuel[this.etapeChemin + 1].y;
        const zIndex = fromZ + (toZ - fromZ) * this.progression + 0.5;

        this.player.setSpritePosition(x, y, zIndex);
    }

    /**
     * Termine le déplacement
     */
    terminerDeplacement() {
        this.enDeplacement = false;
        this.cheminActuel = null;
        this.afficherCasesAtteignables();
    }

    /**
     * Retourne si le joueur est en déplacement
     */
    estEnDeplacement() {
        return this.enDeplacement;
    }
}
