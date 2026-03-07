import { BASE_PM, COULEUR_JOUEUR } from '../constants.js';
import { grilleVersEcran } from '../utils/coordinates.js';
import { Combatant } from './combatant.js';

const PLAYER_CONFIG = {

    nom: 'Joueur',
    pvMax: 100,
    paMax: 6,
    pmMax: 3,
    degats: 15,
    porteeAttaque: 3,
    couleur: 0x4488ff
}

export class Player extends Combatant {

        constructor(grilleX, grilleY, mapContainer) {
            super(grilleX, grilleY, PLAYER_CONFIG, mapContainer);
        }
}

function creerSpriteJoueur(couleur) {
    const sprite = new PIXI.Graphics();
    sprite.rect(-12, -40, 24, 40);
    sprite.fill(couleur);
    return sprite;
}

/**
 * Classe représentant le joueur
 */
export class Player {
    constructor(grilleX, grilleY, mapContainer) {
        this.grilleX = grilleX;
        this.grilleY = grilleY;
        this.pm = BASE_PM;
        this.sprite = creerSpriteJoueur(COULEUR_JOUEUR);

        this.updatePosition();
        mapContainer.addChild(this.sprite);
    }

    /**
     * Met à jour la position du sprite selon les coordonnées grille
     */
    updatePosition() {
        const pos = grilleVersEcran(this.grilleX, this.grilleY);
        this.sprite.x = pos.x;
        this.sprite.y = pos.y;
        this.sprite.zIndex = this.grilleX + this.grilleY + 0.5;
    }

    /**
     * Définit la position du joueur sur la grille
     */
    setPosition(grilleX, grilleY) {
        this.grilleX = grilleX;
        this.grilleY = grilleY;
        this.updatePosition();
    }

    /**
     * Définit la position du sprite directement (pour l'animation)
     */
    setSpritePosition(x, y, zIndex) {
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.zIndex = zIndex;
    }

    /**
     * Réduit les PM du joueur
     */
    depensePM(cout) {
        this.pm -= cout;
    }

    /**
     * Réinitialise les PM du joueur
     */
    resetPM() {
        this.pm = BASE_PM;
    }

    /**
     * Retourne les PM actuels
     */
    getPM() {
        return this.pm;
    }
}
