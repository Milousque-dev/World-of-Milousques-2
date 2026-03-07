export class TurnManager {

    constructor() {

        this.combatants = [];
        this.indexActuel = -1;
        this.tourEnCours = false;
    }

    initCombat(combatants) {

        this.combatants = combatants.filter(c => !c.estMort());
        this.indexActuel = -1;
        this.tourEnCours = true;
    }

    prochainTour() {

        this.combatants = this.combatants.filter(c => !c.estMort());

        if (this.combatants.length <= 1) {
            this.tourEnCours = false;
            return null;
        }

        this.indexActuel = (this.indexActuel + 1) % this.combatants.length;
        const combattant = this.getCombattantActuel();
        combattant.debutTour();
        return combattant;
    }

    getCombattantActuel() {

        if (this.indexActuel < 0) return null;
        return this.combatants[this.indexActuel];
    }

    estCombatTermine() {

        return !this.tourEnCours;
    }
}
