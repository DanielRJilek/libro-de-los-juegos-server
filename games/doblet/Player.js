const Board = require('./Board');

class Player {
    constructor(username) {
        this.username = username;
        this.Board = new Board();
        this.phase = 1;
    }
}

module.exports = Player;