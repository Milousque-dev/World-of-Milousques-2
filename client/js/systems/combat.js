import { COUT_PA_ATTAQUE, COULEUR_TILE_ATTAQUE, COULEUR_STROKE_ATTAQUE } from '../constants.js';
import { getCasesAtteignables, trouverChemin } from '../utils/pathfinding.js';
import { grilleVersEcran } from '../utils/coordinates.js';
import { dessinerTile, getCouleurTile } from '../rendering/tile.js';
import { TurnManager } from './turnManager.js';
import { Player } from '../entities/player.js';

export class CombatSystem {
    constructor(player, ennemis, grille, hud) {
        this.player = player;
        this.ennemis = ennemis;
        this.grille = grille;
        this.hud = hud;

        this.turnManager = new TurnManager();

        // État
        this.tilesAttaque = [];      // cases d'attaque affichées
        this.tilesIlluminees = [];   // cases de déplacement affichées
        this.enAnimation = false;

        // Animation de déplacement (repris de MovementSystem)
        this.cheminActuel = null;
        this.etapeChemin = 0;
        this.progression = 0;
        this.combattantAnime = null;
        this.callbackFinDeplacement = null;
    }

    /**
     * Lance le combat
     */
    init() {
        const tousLesCombattants = [this.player, ...this.ennemis];
        this.turnManager.initCombat(tousLesCombattants);
        this.prochainTour();
    }

    /**
     * Passe au tour suivant
     */
    prochainTour() {
        const combattant = this.turnManager.prochainTour();

        if (this.turnManager.estCombatTermine()) {
            this.finDeCombat();
            return;
        }

        this.hud.updateTour(combattant);
        this.hud.updateStats(combattant);

        if (combattant instanceof Player) {
            this.debutTourJoueur();
        } else {
            this.debutTourEnnemi(combattant);
        }
    }

    /**
     * Tour du joueur : afficher les options
     */
    debutTourJoueur() {
        this.afficherCasesAtteignables(this.player);
        this.afficherCasesAttaque(this.player);
    }

    /**
     * Gère le clic du joueur pendant son tour
     */
    handleClick(cellX, cellY) {
        if (this.enAnimation) return;

        const combattant = this.turnManager.getCombattantActuel();
        if (!(combattant instanceof Player)) return;

        // Vérifier si on clique sur un ennemi à portée (attaque)
        const ennemiCible = this.getEnnemiSurCase(cellX, cellY);
        if (ennemiCible && this.estCaseAttaque(cellX, cellY)) {
            this.attaquer(this.player, ennemiCible);
            return;
        }

        // Sinon, essayer de se déplacer
        if (this.estCaseAtteignable(cellX, cellY)) {
            this.lancerDeplacement(this.player, cellX, cellY, () => {
                this.rafraichirUI();
            });
        }
    }

    /**
     * Le joueur termine son tour manuellement
     */
    finTourJoueur() {
        if (this.enAnimation) return;
        this.effacerTout();
        this.prochainTour();
    }

    // --- Attaque ---

    attaquer(attaquant, cible) {
        if (attaquant.pa < COUT_PA_ATTAQUE) return;
        if (!attaquant.estAPortee(cible, attaquant.porteeAttaque)) return;

        attaquant.depensePA(COUT_PA_ATTAQUE);
        cible.subirDegats(attaquant.degats);

        // Flash visuel sur la cible
        this.flashDegats(cible);

        this.hud.updateStats(this.turnManager.getCombattantActuel());
        this.hud.afficherMessage(`${attaquant.nom} inflige ${attaquant.degats} dégâts à ${cible.nom} !`);

        if (cible.estMort()) {
            cible.sprite.visible = false;
            this.hud.afficherMessage(`${cible.nom} est vaincu !`);
        }

        // Si c'est le tour du joueur, rafraîchir l'affichage
        if (attaquant instanceof Player) {
            this.rafraichirUI();
        }
    }

    flashDegats(cible) {
        const original = { x: cible.sprite.x, y: cible.sprite.y };
        cible.sprite.tint = 0xff0000;
        setTimeout(() => {
            cible.sprite.tint = 0xffffff;
        }, 200);
    }

    // --- IA Ennemi ---

    debutTourEnnemi(ennemi) {
        // Petit délai pour que le joueur voie que c'est le tour de l'ennemi
        setTimeout(() => {
            this.executerIA(ennemi);
        }, 500);
    }

    executerIA(ennemi) {
        if (ennemi.estMort()) {
            this.prochainTour();
            return;
        }

        // Si à portée d'attaque → attaquer
        if (ennemi.estAPortee(this.player, ennemi.porteeAttaque) && ennemi.pa >= COUT_PA_ATTAQUE) {
            this.attaquer(ennemi, this.player);

            if (this.player.estMort()) {
                this.finDeCombat();
                return;
            }

            // Essayer d'attaquer encore si assez de PA
            if (ennemi.estAPortee(this.player, ennemi.porteeAttaque) && ennemi.pa >= COUT_PA_ATTAQUE) {
                setTimeout(() => {
                    this.attaquer(ennemi, this.player);
                    this.finTourIA();
                }, 500);
                return;
            }

            this.finTourIA();
            return;
        }

        // Sinon → se rapprocher du joueur
        if (ennemi.pm > 0) {
            const destination = this.trouverCaseVersCible(ennemi, this.player);

            if (destination) {
                this.lancerDeplacement(ennemi, destination.x, destination.y, () => {
                    // Après le déplacement, essayer d'attaquer
                    if (ennemi.estAPortee(this.player, ennemi.porteeAttaque) && ennemi.pa >= COUT_PA_ATTAQUE) {
                        setTimeout(() => {
                            this.attaquer(ennemi, this.player);
                            this.finTourIA();
                        }, 300);
                    } else {
                        this.finTourIA();
                    }
                });
                return;
            }
        }

        this.finTourIA();
    }

    trouverCaseVersCible(ennemi, cible) {
        const casesAccessibles = getCasesAtteignables(ennemi.grilleX, ennemi.grilleY, ennemi.pm);

        if (casesAccessibles.length === 0) return null;

        // Filtrer les cases occupées
        const casesLibres = casesAccessibles.filter(c => !this.getCombattantSurCase(c.x, c.y));

        if (casesLibres.length === 0) return null;

        // Trouver la case la plus proche de la cible
        let meilleure = null;
        let meilleureDistance = Infinity;

        for (const c of casesLibres) {
            const dist = Math.abs(c.x - cible.grilleX) + Math.abs(c.y - cible.grilleY);
            if (dist < meilleureDistance) {
                meilleureDistance = dist;
                meilleure = c;
            }
        }

        return meilleure;
    }

    finTourIA() {
        setTimeout(() => {
            this.prochainTour();
        }, 300);
    }

    // --- Déplacement (partagé joueur/ennemi) ---

    lancerDeplacement(combattant, destX, destY, callback) {
        const chemin = trouverChemin(combattant.grilleX, combattant.grilleY, destX, destY);
        if (!chemin || chemin.length < 2) {
            if (callback) callback();
            return;
        }

        combattant.depensePM(chemin.length - 1);
        this.effacerTout();

        this.cheminActuel = chemin;
        this.etapeChemin = 0;
        this.progression = 0;
        this.combattantAnime = combattant;
        this.callbackFinDeplacement = callback;
        this.enAnimation = true;
    }

    update() {
        if (!this.enAnimation || !this.cheminActuel) return;

        this.progression += 0.08;

        if (this.progression >= 1) {
            this.progression = 0;
            this.etapeChemin++;

            this.combattantAnime.setPosition(
                this.cheminActuel[this.etapeChemin].x,
                this.cheminActuel[this.etapeChemin].y
            );

            if (this.etapeChemin >= this.cheminActuel.length - 1) {
                this.enAnimation = false;
                this.cheminActuel = null;

                if (this.callbackFinDeplacement) {
                    this.callbackFinDeplacement();
                }
                return;
            }
        } else {
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

            this.combattantAnime.setSpritePosition(x, y, zIndex);
        }
    }

    // --- Affichage des cases ---

    afficherCasesAtteignables(combattant) {
        this.effacerCasesAtteignables();
        const cases = getCasesAtteignables(combattant.grilleX, combattant.grilleY, combattant.pm);

        for (const c of cases) {
            // Ne pas illuminer les cases occupées
            if (this.getCombattantSurCase(c.x, c.y)) continue;

            const tile = this.grille[c.x][c.y];
            dessinerTile(tile, 0x4444aa, 0x3333aa);
            this.tilesIlluminees.push({ x: c.x, y: c.y });
        }
    }

    afficherCasesAttaque(combattant) {
        this.effacerCasesAttaque();

        for (const ennemi of this.ennemis) {
            if (ennemi.estMort()) continue;
            if (combattant.estAPortee(ennemi, combattant.porteeAttaque)
                && combattant.pa >= COUT_PA_ATTAQUE) {
                const tile = this.grille[ennemi.grilleX][ennemi.grilleY];
                dessinerTile(tile, COULEUR_TILE_ATTAQUE, COULEUR_STROKE_ATTAQUE);
                this.tilesAttaque.push({ x: ennemi.grilleX, y: ennemi.grilleY });
            }
        }
    }

    effacerCasesAtteignables() {
        for (const c of this.tilesIlluminees) {
            dessinerTile(this.grille[c.x][c.y], getCouleurTile(c.x, c.y));
        }
        this.tilesIlluminees = [];
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

    rafraichirUI() {
        this.effacerTout();
        this.afficherCasesAtteignables(this.player);
        this.afficherCasesAttaque(this.player);
        this.hud.updateStats(this.player);
    }

    // --- Utilitaires ---

    estCaseAtteignable(x, y) {
        return this.tilesIlluminees.some(c => c.x === x && c.y === y);
    }

    estCaseAttaque(x, y) {
        return this.tilesAttaque.some(c => c.x === x && c.y === y);
    }

    getEnnemiSurCase(x, y) {
        return this.ennemis.find(e => !e.estMort() && e.grilleX === x && e.grilleY === y) || null;
    }

    getCombattantSurCase(x, y) {
        if (this.player.grilleX === x && this.player.grilleY === y) return this.player;
        return this.getEnnemiSurCase(x, y);
    }

    finDeCombat() {
        this.effacerTout();

        if (this.player.estMort()) {
            this.hud.afficherMessage('DÉFAITE...');
        } else {
            this.hud.afficherMessage('VICTOIRE !');
        }
    }
}
