import { TILE_WIDTH, TILE_HEIGHT } from '../constants.js';

/**
 * Convertit des coordonnées de grille en coordonnées écran isométriques
 */
export function grilleVersEcran(grilleX, grilleY) {
    return {
        x: (grilleX - grilleY) * (TILE_WIDTH / 2),
        y: (grilleX + grilleY) * (TILE_HEIGHT / 2)
    };
}

/**
 * Convertit des coordonnées écran en coordonnées de grille
 */
export function ecranVersGrille(ecranX, ecranY) {
    return {
        x: Math.round((ecranX / (TILE_WIDTH / 2) + ecranY / (TILE_HEIGHT / 2)) / 2),
        y: Math.round((ecranY / (TILE_HEIGHT / 2) - ecranX / (TILE_WIDTH / 2)) / 2)
    };
}
