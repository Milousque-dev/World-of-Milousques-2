import { COUT_PA_ATTAQUE } from '../constants.js';
import { TurnManager } from './turnManager.js';
import { MovementAnimator } from './movementAnimator.js';
import { TileHighlighter } from './tileHighlighter.js';
import { EnemyAI } from './enemyAI.js';
import { Player } from '../entities/player.js';

export class CombatSystem {

    constructor(player, ennemis, grille, hud) {
        this.player = player;
        this.ennemis = ennemis;
        this.hud = hud;

        this.turnManager = new TurnManager();
        this.animator = new MovementAnimator();
        this.highlighter = new TileHighlighter(grille);

        this.enemyAI = new EnemyAI(

            this.animator,
            (attaquant, cible) => this.attaquer(attaquant, cible),
            (x, y) => this.getCombattantSurCase(x, y)
        );
    }

    init() {

        this.turnManager.initCombat([this.player, ...this.ennemis]);
        this.prochainTour();
    }

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

            setTimeout(() => {

                this.enemyAI.executerTour(
                    combattant,
                    this.player,
                    () => setTimeout(() => this.prochainTour(), 300),
                    () => this.finDeCombat()
                );

            }, 500);
        }
    }

    debutTourJoueur() {

        this.highlighter.afficherCasesAtteignables(this.player, (x, y) => this.getCombattantSurCase(x, y));
        this.highlighter.afficherCasesAttaque(this.player, this.ennemis);
    }

    handleClick(cellX, cellY) {

        if (this.animator.enAnimation) return;

        const combattant = this.turnManager.getCombattantActuel();

        if (!(combattant instanceof Player)) return;

        const ennemiCible = this.getEnnemiSurCase(cellX, cellY);

        if (ennemiCible && this.highlighter.estCaseAttaque(cellX, cellY)) {
            this.attaquer(this.player, ennemiCible);
            return;
        }

        if (this.highlighter.estCaseAtteignable(cellX, cellY)) {
            this.highlighter.effacerTout();
            this.animator.lancerDeplacement(this.player, cellX, cellY, () => {
                this.rafraichirUI();
            });
        }
    }

    finTourJoueur() {

        if (this.animator.enAnimation) return;
        this.highlighter.effacerTout();
        this.prochainTour();
    }

    attaquer(attaquant, cible) {

        if (attaquant.pa < COUT_PA_ATTAQUE) return;
        if (!attaquant.estAPortee(cible, attaquant.porteeAttaque)) return;

        attaquant.depenserPA(COUT_PA_ATTAQUE);
        cible.subirDegats(attaquant.degats);

        this.flashDegats(cible);

        this.hud.updateStats(this.turnManager.getCombattantActuel());
        this.hud.afficherMessage(`${attaquant.nom} inflige ${attaquant.degats} dégâts à ${cible.nom} !`);

        if (cible.estMort()) {

            cible.sprite.visible = false;
            this.hud.afficherMessage(`${cible.nom} est vaincu !`);
        }

        if (attaquant instanceof Player) {

            this.rafraichirUI();
        }
    }

    flashDegats(cible) {

        cible.sprite.tint = 0xff0000;
        setTimeout(() => { cible.sprite.tint = 0xffffff; }, 200);
    }

    rafraichirUI() {

        this.highlighter.effacerTout();
        this.highlighter.afficherCasesAtteignables(this.player, (x, y) => this.getCombattantSurCase(x, y));
        this.highlighter.afficherCasesAttaque(this.player, this.ennemis);
        this.hud.updateStats(this.player);
    }

    getEnnemiSurCase(x, y) {

        return this.ennemis.find(e => !e.estMort() && e.grilleX === x && e.grilleY === y) || null;
    }

    getCombattantSurCase(x, y) {

        if (this.player.grilleX === x && this.player.grilleY === y) return this.player;

        return this.getEnnemiSurCase(x, y);
    }

    finDeCombat() {

        this.highlighter.effacerTout();
        this.hud.afficherMessage(this.player.estMort() ? 'DÉFAITE...' : 'VICTOIRE !');
    }

    update() {
        
        this.animator.update();
    }
}
