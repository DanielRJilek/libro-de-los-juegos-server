const Board = require('./Board');

class Player {
    constructor(id) {
        this.id = id;
        this.phase = 1;
    }
}

module.exports = Player;