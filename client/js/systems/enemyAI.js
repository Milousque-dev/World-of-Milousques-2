import { COUT_PA_ATTAQUE } from '../constants.js';
import { getCasesAtteignables } from '../utils/pathfinding.js';

export class EnemyAI {

    constructor(movementAnimator, attaquerFn, getCombattantSurCase) {

        this.movementAnimator = movementAnimator;
        this.attaquer = attaquerFn;
        this.getCombattantSurCase = getCombattantSurCase;
    }

    executerTour(ennemi, player, finTourFn, finCombatFn) {

        if (ennemi.estMort()) {

            finTourFn();
            return;
        }

        if (ennemi.estAPortee(player, ennemi.porteeAttaque) && ennemi.pa >= COUT_PA_ATTAQUE) {

            this.attaquer(ennemi, player);

            if (player.estMort()) {

                finCombatFn();
                return;
            }

            if (ennemi.estAPortee(player, ennemi.porteeAttaque) && ennemi.pa >= COUT_PA_ATTAQUE) {

                setTimeout(() => {

                    this.attaquer(ennemi, player);
                    finTourFn();

                }, 500);

                return;
            }

            finTourFn();
            return;
        }

        if (ennemi.pm > 0) {

            const destination = this.trouverCaseVersCible(ennemi, player);

            if (destination) {

                this.movementAnimator.lancerDeplacement(ennemi, destination.x, destination.y, () => {

                    if (ennemi.estAPortee(player, ennemi.porteeAttaque) && ennemi.pa >= COUT_PA_ATTAQUE) {

                        setTimeout(() => {

                            this.attaquer(ennemi, player);
                            finTourFn();
                    
                        }, 300);

                    } else {
                        finTourFn();
                    }
                });

                return;
            }
        }

        finTourFn();
    }

    trouverCaseVersCible(ennemi, cible) {

        const casesAccessibles = getCasesAtteignables(ennemi.grilleX, ennemi.grilleY, ennemi.pm);

        if (casesAccessibles.length === 0) return null;

        const casesLibres = casesAccessibles.filter(c => !this.getCombattantSurCase(c.x, c.y));

        if (casesLibres.length === 0) return null;

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
}
