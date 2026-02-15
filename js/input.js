class InputHandler{
    constructor(game){
        this.game = game;
        // Tengo traccia dei tasti premuti
        this.keys = [];
        window.addEventListener("keydown", e => {
            if(e.repeat) return; // Se tengo premuto chiamo una sola volta l'evento

            if((e.key === 'w' ||
                e.key === 'a' ||
                e.key === 's' ||
                e.key === 'd' 
                //Eventualmente aggiungere altri tasti
            ) && this.keys.indexOf(e.key) === -1){
                this.keys.push(e.key) //Se non è presente aggiungo all'array
            } else if(e.key === 'p'){ //gestire p di Pausa
                this.game.togglePause();
            } else if(e.key === 'e'){
                this.game.openChest();
            } else if(e.key === 'q'){
                this.game.player.usePotion();
            }
        });

        window.addEventListener("keyup", e => {
            if( e.key === 'w' ||
                e.key === 'a' ||
                e.key === 's' ||
                e.key === 'd' ||
                e.key === 'p' 
            ) 
                //Quando smetto di premere il tasto, lo tolgo dall'array
                this.keys.splice(this.keys.indexOf(e.key), 1);
        });


    }

}


