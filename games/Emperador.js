const TableGame = require('./TableGame');

class Emperador extends TableGame {
    setup() {
        this.randomizePlayers();
        this.currentPlayerNumber = 1;
        this.turnStage = "roll";
        this.dice = [{value: 1, used: true}, {value: 1, used: true}, {value: 1, used: true}];
        this.board = Array.from({ length: 25 }, () => ({p1: 0, p2: 0}));
        // bar
        this.board[0] = {p1: [], p2: []};
        // pieces are pushed on to the bar with their next point
        this.board[1].p1 = 15;
        this.board[24].p2 = 15;
    }

    isValidMove(move) {
        const player = this.getPlayerByNumber(move.playerNumber);
        const opponent = this.getOpponent(player);
        // generic checks
        if (!player) {
            console.log("player not found");
            return false;
        }
        if (!this.diceAvailable(move.diceValue)) {
            console.log("dice not available");
            return false;
        }
        if (move.playerNumber != this.currentPlayerNumber) {
            console.log("player number not current");
            return false;
        }
        if (this.board[0][this.playerKey(move.playerNumber)].length > 0 && move.fromCol != 0) {
            console.log("player has a piece on the bar");
            return false;
        }
        if (this.board[move.toCol][this.playerKey(opponent.playerNumber)] > 1) {
            console.log("opponent has more than 1 piece in the destination col");
            return false;
        }
        if (move.toCol == 0) {
            console.log("to col is bar");
            return false;
        }
        // phase 1 checks
        if (player.phase == 1) {
            // reentry
            if (move.fromCol == 0) {
                if (this.board[0][this.playerKey(move.playerNumber)].length == 0) {
                    console.log("player has no pieces on the bar");
                    return false;
                }
                if (player.playerNumber == 1) {
                    if (move.toCol != (this.reentryPoint(move.playerNumber) - 1) + move.diceValue) {
                        console.log("move to col is not the reentry point plus the dice value");
                        return false;
                    }
                }
                else {
                    if (move.toCol != (this.reentryPoint(move.playerNumber) + 1) - move.diceValue) {
                        console.log("move to col is not the reentry point minus the dice value");
                        return false;
                    }
                }
            }
            // normal move
            else {
                if (this.board[move.fromCol][this.playerKey(move.playerNumber)] == 0) {
                    console.log("player has no pieces in from col");
                    return false;
                }
                if (player.playerNumber == 1) {
                    if (move.toCol - move.fromCol != move.diceValue) {
                        return false;
                    }
                }
                else {
                    if (move.fromCol - move.toCol != move.diceValue) {
                        return false;
                    }
                }
            }
        }
        // phase 2 checks
        else if (player.phase == 2) {
            if (this.board[move.fromCol][this.playerKey(move.playerNumber)] == 0) {
                console.log("player has no pieces in from col");
                return false;
            }
            // bear off
            if (move.toCol == null) {
                if (player.playerNumber == 1) {
                    if (move.fromCol != 18 + move.diceValue) {
                        return false;
                    }
                }
                else {
                    if (move.fromCol != move.diceValue) {
                        return false;
                    }
                }
            }
            // normal move
            else {
                if (this.board[move.fromCol][this.playerKey(move.playerNumber)] == 0) {
                    console.log("player has no pieces in from col");
                    return false;
                }
                if (player.playerNumber == 1) {
                    if (move.toCol - move.fromCol != move.diceValue) {
                        return false;
                    }
                }
                else {
                    if (move.fromCol - move.toCol != move.diceValue) {
                        return false;
                    }
                }
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
            if (move.fromCol == 0) {
                this.board[0][this.playerKey(move.playerNumber)].pop();
                this.board[move.toCol][this.playerKey(move.playerNumber)]++;
            }
            else {
                this.board[move.fromCol][this.playerKey(move.playerNumber)]--;
                this.board[move.toCol][this.playerKey(move.playerNumber)]++;
            }
            if (this.canHit(move.playerNumber, move.toCol)) {
                this.board[move.toCol][this.playerKey(opponent.playerNumber)] = 0;
                this.board[0][this.playerKey(opponent.playerNumber)].push(move.toCol);
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

    getPlayerPieces(playerNumber) {
        const key = this.playerKey(playerNumber);
        const pieces = [];
        if (this.board[0][key].length > 0) {
            pieces.push(0);
        }
        for (let i = 1; i < 25; i++) {
            if (this.board[i][key] > 0) {
                pieces.push(i);
            }
        }
        return pieces;
    }

    isPhaseOneOver(playerNumber) {
        if (this.getPlayerByNumber(playerNumber).phase != 1) {
            return false;
        }
        if (this.board[0][this.playerKey(playerNumber)].length > 0) {
            return false;
        }
        if (playerNumber == 1) {
            for (let i=1; i<18; i++) {
                if (this.board[i][this.playerKey(playerNumber)] > 0) {
                    return false;
                }
            }
        }
        else {
            for (let i=7; i<25; i++) {
                if (this.board[i][this.playerKey(playerNumber)] > 0) {
                    return false;
                }
            }
        }
        return true;
    }

    reentryPoint(playerNumber) {
        if (playerNumber == 1) {
            return 1;
        }
        else {
            return 24;
        }
    }
}

module.exports = Emperador;