const TableGame = require('./TableGame');

class SeisDosYAs extends TableGame {
    setup() {
        this.randomizePlayers();
        this.currentPlayerNumber = 1;        
        this.dice = [{value: 1, used: true}, {value: 1, used: true}];
        this.turnStage = "roll";
        this.board = Array.from({ length: 25 }, () => ({p1: 0, p2: 0}));
        this.board[0] = {p1: [], p2: []};
        this.board[1].p1 = 3;
        this.board[2].p1 = 4;
        this.board[3].p2 = 5;
        this.board[4].p2 = 5;
        this.board[5].p2 = 5;
        this.board[6].p1 = 8;
    }

    isValidMove(move) {
        const player = this.getPlayerByNumber(move.playerNumber);
        const opponent = this.getOpponent(player);
        if (!player) {
            console.log("player not found");
            return false;
        }
        if (!this.diceAvailable(move.diceValue)) {
            console.log("dice not available");
            return false;
        }
        if (move.playerNumber != this.currentPlayerNumber && this.turnStage != "steal") {
            console.log("player number not current");
            return false;
        }
        if (this.board[move.fromCol][this.playerKey(move.playerNumber)] == 0) {
            console.log("player has no pieces in from col");
            return false;
        }
        if (this.board[0][this.playerKey(move.playerNumber)] > 0 && move.fromCol != 0) {
            console.log("player has a piece on the bar");
            return false;
        }
        if (player.phase == 1) {
            if (move.fromCol == 0) {
                if (move.toCol != move.diceValue + 1) {
                    return false;
                }
            }
            else {
                if (move.toCol - move.fromCol != move.diceValue) {
                    return false;
                }
                if (this.board[move.toCol][this.playerKey(opponent.playerNumber)] > 1) {
                    console.log("opponent has more than 1 piece in the destination col");
                    return false;
                }
            }
        }
        else if (player.phase == 2) {
            if (move.fromCol > move.diceValue && move.fromCol != move.diceValue
                || move.toCol - move.fromCol != move.diceValue) {
                return false;
            }
        }
        return true;
    }

    makeMove(move) {
        const player = this.getPlayerByNumber(move.playerNumber);
        const opponent = this.getOpponent(player);
        if (!this.isValidMove(move)) {
            return false;
        }
        else {
            this.board[move.fromCol][this.playerKey(move.playerNumber)]--;
            this.board[move.toCol][this.playerKey(move.playerNumber)]++;
            if (this.canHit(move.playerNumber, move.toCol)) {
                this.board[move.toCol][this.playerKey(opponent.playerNumber)] = 0;
                this.board[0][this.playerKey(opponent.playerNumber)].push(move.toCol);
            }
        }
        this.dice.find(d => d.value == move.diceValue && !d.used).used = true;
        if (this.isPhaseOneOver(move.playerNumber)) {
            player.phase = 2;
        }
        if (this.isGameOver()) {
            this.winner = this.getPlayerByNumber(move.playerNumber);
            return true;
        }
        if (this.dice.every(d => d.used)) {
            this.endTurn();
        }
        if (this.opponentCanSteal()) {
            this.turnStage = "steal";
        }
        return true;
    }

    isGameOver() {
        let player1pieces = 0;
        let player2pieces = 0;
        for (let i=1; i<25; i++) {
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

    isPhaseOneOver(playerNumber) {
        if (this.getPlayerByNumber(playerNumber).phase != 1) {
            return false;
        }
        for (let i=1; i<19; i++) {
            if (this.board[i][this.playerKey(playerNumber)] > 0) {
                return false;
            }
        }
        return true;
    }
}

module.exports = SeisDosYAs;