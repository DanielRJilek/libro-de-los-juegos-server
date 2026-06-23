class TableGame {
    constructor(instance) {
        this.id = instance._id || null;
        this.players = instance.players;
        this.board = instance.board || null;
        this.winner = null;
        this.dice = instance.dice || [];
        this.currentPlayerNumber = instance.currentPlayerNumber || null;
        this.turnStage = instance.turnStage || null;
    }
    endGame(player) {
        this.winner = player;
    }
    roll(count) {
        this.dice = [];
        for (let i = 0; i < count; i++) {
            this.dice.push({value: Math.floor(Math.random() * 6) + 1, used: false});
        }
        this.turnStage = "move";
    }
    randomizePlayers() {
        const randomNumber = Math.floor(Math.random() * 2) + 1;
        if (randomNumber == 1) {
            this.players[0].playerNumber = 1;
            this.players[1].playerNumber = 2;
        }
        else {
            this.players[0].playerNumber = 2;
            this.players[1].playerNumber = 1;
        }
    }
    getPlayerByNumber(n) {
        return this.players.find(p => p.playerNumber === n);
    }
    getOpponent(player) {
        return this.players.find(p => p._id.toString() != player._id.toString());
    }
    setCurrentPlayerNumber(playerNumber) {
        this.currentPlayerNumber = playerNumber;
    }
    playerKey(playerNumber) {
        return `p${playerNumber}`;  // 1 → "p1", 2 → "p2"
    }
    diceAvailable(number) {
        for (let i=0; i<this.dice.length; i++) {
            if (this.dice[i].value == number && this.dice[i].used == false) {
                return true;
            }
        }
        return false;
    }
    setup() { throw new Error('setup() not implemented'); }
    isGameOver() { throw new Error('isGameOver() not implemented'); }
    isValidMove(move) { throw new Error('isValidMove() not implemented'); }
    makeMove(move) { throw new Error('makeMove() not implemented'); }
    endTurn() { throw new Error('endTurn() not implemented'); }
}

module.exports = TableGame;