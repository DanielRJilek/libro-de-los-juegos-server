const TableGame = require('./TableGame');

class Laquet extends TableGame {
    setup() {
        this.randomizePlayers();
        this.currentPlayerNumber = 1;
        this.dice = [{value: 1, used: true}, {value: 1, used: true}];
        this.turnStage = "roll";
        this.board = Array.from({ length: 25 }, () => ({p1: 0, p2: 0}));
        this.board[7].p1 = 2;
        for (let i=8; i<12; i++) {
            this.board[i].p1 = 3;
        }
        this.board[12].p2 = 14;
        this.board[13].p2 = 1;
        this.board[24].p1 = 1;
    }

    roll() {
        super.roll();
        if (this.opponentCanSteal()) {
            this.turnStage = "steal";
        }
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
        if (move.fromCol == 0) {
            console.log("from col is bar");
            return false;
        }
        if (this.board[move.fromCol][this.playerKey(move.playerNumber)] == 0) {
                console.log("player has no pieces in from col");
                return false;
        }
        if (player.phase == 1) {
            if (move.toCol - move.fromCol != move.diceValue) {
                return false;
            }
            if (this.board[move.toCol][this.playerKey(opponent.playerNumber)] > 0) {
                console.log("opponent has pieces in to col");
                return false;
            }            
        }
        else if (player.phase == 2) {
            if (25 - move.fromCol > move.diceValue && move.fromCol != move.diceValue 
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

    opponentCanSteal() {
        if (this.noValidMoves(this.getPlayerByNumber(this.currentPlayerNumber)) 
                && !this.noValidMoves(this.getOpponent(this.getPlayerByNumber(this.currentPlayerNumber)))) {
            return true;
        }
        return false;
    }
}
module.exports = Laquet;