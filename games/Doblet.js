const TableGame = require('./TableGame');

class Doblet extends TableGame {
    setup() {
        this.randomizePlayers();
        this.currentPlayerNumber = 1;
        this.turnStage = "roll";
        this.dice = [{value: 1, used: true}, {value: 1, used: true}, {value: 1, used: true}];
        this.board = Array.from({ length: 24 }, () => Array.from({ length: 2 }, () => ({p1: 0, p2: 0})));
        for (let i=0; i<6; i++) {
            this.board[i][0].p1 = 2;
        }
        for (let i=12; i<18; i++) {
            this.board[i][0].p2 = 2;
        }
    }

    roll(count) {
        super.roll(count);
        if (this.opponentCanSteal()) {
            this.turnStage = "steal";
        }
    }

    getPlayerPieces(playerNumber) {
        let pieces = [];
        for (let i=0; i<24; i++) {
            for (let j=0; j<2; j++) {
                if (this.board[i][j][this.playerKey(playerNumber)] > 0) {
                    pieces.push({col: i, row: j});
                }
            }
        }
        return pieces;
    }

    isGameOver() {
        let player1pieces = 0;
        let player2pieces = 0;
        for (let i=0; i<24; i++) {
            for (let j=0; j<2; j++) {
                if (this.board[i][j].p1 > 0) {
                    player1pieces += this.board[i][j].p1;
                }   
                if (this.board[i][j].p2 > 0) {
                    player2pieces += this.board[i][j].p2;
                }
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
        if (this.board[move.fromCol][move.fromRow][this.playerKey(move.playerNumber)] == 0) {
            console.log("player has no pieces at that position");
            return false;
        }
        if (move.diceValue != move.fromCol) {
            console.log("dice value does not match from col");
            return false;
        }
        if (player.phase == 1) {
            if (this.board[move.toCol][move.toRow][this.playerKey(move.playerNumber)] != 0) {
                return false;
            }
        }
        else if (player.phase == 2) {
            if (move.toCol != null) {
                console.log("to col is not null");
                return false;
            }
        }
        return true;
    }

    makeMove(move) {
        if (!this.isValidMove(move)) {
            return false;
        }
        if (move.toCol == null) {
            this.board[move.fromCol][move.fromRow][this.playerKey(move.playerNumber)]--;
        }
        else {
            this.board[move.fromCol][move.fromRow][this.playerKey(move.playerNumber)]--;
            this.board[move.toCol][move.toRow][this.playerKey(move.playerNumber)]++;
        }
        this.dice.find(d => d.value == move.diceValue && !d.used).used = true;
        if (this.isGameOver()) {
            this.winner = this.getPlayerByNumber(move.playerNumber);
            return true;
        }
        if (this.isPhaseOneOver(move.playerNumber)) {
            this.getPlayerByNumber(move.playerNumber).phase = 2;
        }
        if (this.dice.every(d => d.used)) {
            this.endTurn();
        }
        if (this.opponentCanSteal()) {
            this.turnStage = "steal";
        }
        return true;
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

    isPhaseOneOver(playerNumber) {
        if (this.getPlayerByNumber(playerNumber).phase != 1) {
            return false;
        }
        for (let i=0; i<6; i++) {
            if (this.board[i][0][this.playerKey(playerNumber)] != 1) {
                return false;
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

module.exports = Doblet;