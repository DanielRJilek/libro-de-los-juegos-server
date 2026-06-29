const TableGame = require('./TableGame');

class Fallas extends TableGame {
    setup() {
        this.randomizePlayers();
        this.currentPlayerNumber = 1;        
        this.dice = [{value: 1, used: true}, {value: 1, used: true}];
        this.turnStage = "roll";
        this.board = Array.from({ length: 25 }, () => ({p1: 0, p2: 0}));
        this.board[1].p1 = 2;
        this.board[6].p2 = 13;
        this.board[19].p1 = 13;
        this.board[24].p2 = 2;
    }

    isValidMove(move) {}

    makeMove(move) {}

    canHit(playerNumber, point) {
        const player = this.getPlayerByNumber(playerNumber);
        const opponent = this.getOpponent(player);
        if (this.board[point][this.playerKey(opponent.playerNumber)] == 1 && 
            this.board[point][this.playerKey(playerNumber)] > 0) {
            return true;
        }
        return false;
    }

    getPlayerPieces(playerNumber) {
        let pieces = [];
        for (let i=1; i<25; i++) {
            if (this.board[i][this.playerKey(playerNumber)] > 0) {
                pieces.push(i);
            }
        }
    }

    isGameOver() {}

    endTurn() {}

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

    isPhaseOneOver(playerNumber) {
        if (this.getPlayerByNumber(playerNumber).phase != 1) {
            return false;
        }
        for (let i=7; i<25; i++) {
            if (this.board[i][this.playerKey(playerNumber)] > 0) {
                return false;
            }
        }
        return true;
    }
}

module.exports = Fallas;