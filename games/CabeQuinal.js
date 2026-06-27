const TableGame = require('./TableGame');

class CabeQuinal extends TableGame {
    setup() {
        this.randomizePlayers();
        this.currentPlayerNumber = 1;
        this.turnStage = "roll";
        this.dice = [{value: 1, used: true}, {value: 1, used: true}, {value: 1, used: true}];
        this.board = Array.from({ length: 25 }, () => ({p1: 0, p2: 0}));
        this.board[20].p1 = 15;
        this.board[19].p2 = 15;
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
                if (move.toCol != 25 - move.diceValue) {
                    return false;
                }
            }
            else {
                if (move.fromCol - move.toCol != move.diceValue) {
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
                || move.fromCol - move.toCol != move.diceValue) {
                return false;
            }
        }
        return true;
    }

    canHit(playerNumber, point) {
        const player = this.getPlayerByNumber(playerNumber);
        const opponent = this.getOpponent(player);
        if (this.board[point][this.playerKey(opponent.playerNumber)] == 1 && 
            this.board[point][this.playerKey(playerNumber)] > 0) {
            return true;
        }
        return false;
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
                this.board[0][this.playerKey(opponent.playerNumber)]++;
            }
        }
        this.dice.find(d => d.value == move.diceValue && !d.used).used = true;
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

    getPlayerPieces(playerNumber) {
        let pieces = [];
        for (let i=1; i<25; i++) {
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
        for (let i=7; i<25; i++) {
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