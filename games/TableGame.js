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
    roll() {
        const count = this.dice.length;
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
    getPlayerPieces(playerNumber) {
        let pieces = [];
        if (this.board[0][this.playerKey(playerNumber)]?.length > 0) {
            for (let i = 0; i < this.board[0][this.playerKey(playerNumber)].length; i++) {
                pieces.push(0);
            }
        }
        for (let i=1; i<25; i++) {
            if (this.board[i][this.playerKey(playerNumber)] > 0) {
                for (let j = 0; j < this.board[i][this.playerKey(playerNumber)]; j++) {
                    pieces.push(i);
                }
            }
        }
        return pieces;
    }
    endTurn() {
        this.currentPlayerNumber = this.currentPlayerNumber == 1 ? 2 : 1;
        this.turnStage = "roll";
    }
    noValidMoves(playerNumber) {
        const playerPieces = this.getPlayerPieces(playerNumber);
        const unusedDice = this.dice.filter(d => !d.used);
        for (let dice of unusedDice) {
            for (let piece of playerPieces) {
                let toCol = this.getPlayerByNumber(playerNumber).phase == 2 ? null : piece + dice.value;
                if (this.isValidMove({playerNumber: playerNumber, fromCol: piece, toCol: toCol, diceValue: dice.value})) {
                    return false;
                }
            }
        }
        return true;
    }
    canHit(playerNumber, point) {
        if (point == null) {
            return false;
        }
        if (point > 24 || point < 1) {
            return false;
        }
        const player = this.getPlayerByNumber(playerNumber);
        const opponent = this.getOpponent(player);
        if (this.board[point][this.playerKey(opponent.playerNumber)] == 1 && 
            this.board[point][this.playerKey(playerNumber)] > 0) {
            return true;
        }
        return false;
    }
    setup() { throw new Error('setup() not implemented'); }
    isGameOver() { throw new Error('isGameOver() not implemented'); }
    isValidMove(move) { throw new Error('isValidMove() not implemented'); }
    makeMove(move) { throw new Error('makeMove() not implemented'); }
}

module.exports = TableGame;