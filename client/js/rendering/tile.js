import { TILE_SHAPE, COULEUR_TILE_1, COULEUR_TILE_2, COULEUR_STROKE } from '../constants.js';

/**
 * Retourne la couleur d'une tuile selon sa position (damier)
 */
export function getCouleurTile(x, y) {
    return (x + y) % 2 === 0 ? COULEUR_TILE_1 : COULEUR_TILE_2;
}

/**
 * Dessine une tuile isométrique
 */
export function dessinerTile(tile, couleur, strokeColor = COULEUR_STROKE) {
    tile.clear();
    tile.poly(TILE_SHAPE);
    tile.fill(couleur);
    tile.stroke({ width: 1, color: strokeColor });
}
