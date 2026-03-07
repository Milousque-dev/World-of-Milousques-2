export class HUD {
    constructor(app) {
        this.container = new PIXI.Container();
        app.stage.addChild(this.container);

        this.tourTexte = this.creerTexte(20, 20);
        this.statsTexte = this.creerTexte(20, 50);
        this.messageTexte = this.creerTexte(20, window.innerHeight - 50);
    }

    creerTexte(x, y) {
        const texte = new PIXI.Text({
            text: '',
            style: { fill: 0xffffff, fontSize: 18 }
        });
        texte.x = x;
        texte.y = y;
        this.container.addChild(texte);
        return texte;
    }

    updateTour(combattant) {
        this.tourTexte.text = `Tour : ${combattant.nom}`;
    }

    updateStats(combattant) {
        this.statsTexte.text = `PV: ${combattant.pv}/${combattant.pvMax}  |  PA: ${combattant.pa}/${combattant.paMax}  |  PM: ${combattant.pm}/${combattant.pmMax}`;
    }

    afficherMessage(texte) {
        this.messageTexte.text = texte;
    }
}
