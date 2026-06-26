const TableGame = require('./TableGame');

class CabeQuinal extends TableGame {
    setup() {
        this.randomizePlayers();
        this.currentPlayerNumber = 1;
        this.turnStage = "roll";
        this.dice = [{value: 1, used: true}, {value: 1, used: true}, {value: 1, used: true}];
        this.board = Array.from({ length: 24 }, () => ({p1: 0, p2: 0}));
        this.board[13].p1 = 15;
        this.board[12].p2 = 15;
    }

    roll() {
        super.roll();
        if (this.opponentCanSteal()) {
            this.turnStage = "steal";
        }
    }

    isValidMove(move) {
        return true;
    }

    makeMove(move) {
        this.board[move.fromCol][this.playerKey(move.playerNumber)] -= 1;
        if (move.toCol != null) {
            this.board[move.toCol][this.playerKey(move.playerNumber)] += 1;
        }
    }

    getPlayerPieces(playerNumber) {
        let pieces = [];
        for (let i=0; i<24; i++) {
            if (this.board[i][this.playerKey(playerNumber)] > 0) {
                pieces.push(i);
            }
        }
        return pieces;
    }

    isPhaseOneOver(playerNumber) {
        if (this.getPlayerByNumber(playerNumber).phase != 1) {
            return false;
        }
        for (let i=0; i<18; i++) {
            if (this.board[i][this.playerKey(playerNumber)] > 0) {
                return false;
            }
        }
        return true;
    }

    isGameOver() {
        let player1pieces = 0;
        let player2pieces = 0;
        for (let i=0; i<24; i++) {
            if (this.board[i].p1 > 0) {
                player1pieces += this.board[i].p1;
            }
            if (this.board[i].p2 > 0) {
                player2pieces += this.board[i].p2;
            }
        }
        if (player1pieces == 0) {
            this.winner = this.getPlayerByNumber(1);
            return true;
        }
        if (player2pieces == 0) {
            this.winner = this.getPlayerByNumber(2);
            return true;
        }
        return false;
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

    opponentCanSteal() {
        if (this.noValidMoves(this.getPlayerByNumber(this.currentPlayerNumber)) 
                && !this.noValidMoves(this.getOpponent(this.getPlayerByNumber(this.currentPlayerNumber)))) {
            return true;
        }
        return false;
    }


}

module.exports = CabeQuinal;