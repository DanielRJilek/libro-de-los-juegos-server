/*
This represents the model of the game
*/

function playerId(p) {
    if (!p || p._id == null) return null;
    return typeof p._id === 'object' && p._id.toString ? p._id.toString() : String(p._id);
}

function samePlayer(a, b) {
    const idA = playerId(a);
    const idB = playerId(b);
    if (idA != null && idB != null) return idA === idB;
    return a === b;
}

class Doblet {
    constructor(id, players, board, currentPlayer, dice) {
        this.id = id;
        this.players = players;
        this.board = board;
        this.winner = null;
        this.dice = dice;
        this.currentPlayer = currentPlayer;
        this.otherPlayer = null;
        this.turnMoves = [];
        for (let i=0; i<players.length; i++) {
            if (players[i].playerNumber == 1) {
                this.player1 = players[i];
            }
            else if (players[i].playerNumber == 2) {
                this.player2 = players[i];
            }
            else {
            }
        }
        if (this.player1 && this.player2 && currentPlayer) {
            this.otherPlayer = samePlayer(currentPlayer, this.player1) ? this.player2 : this.player1;
        }
    }

    setup() {
        const randomNumber = Math.floor(Math.random() * 2) + 1;
        if (randomNumber == 1) {
            this.currentPlayer = this.player1;
            this.otherPlayer = this.player2;
        }
        else {
            this.currentPlayer = this.player2;
            this.otherPlayer = this.player1;
        }
        for (let i=0; i<6; i++) {
            this.board[i][0].p1++;
            this.board[i][0].p1++;
            this.board[i][3].p2++;
            this.board[i][3].p2++;
        }
    }

    setCurrentPlayer(player) {
        this.currentPlayer = player;
        this.otherPlayer = samePlayer(player, this.player1) ? this.player2 : this.player1;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    rollDice(count) {
        this.dice = [];
        for (let i=0;i<count;i++) {
            this.dice.push(this.getRandomInt(1,6));
        }
    }

    setPlayerPhase(player, phase) {
        if (!player) return;
        player.phase = phase;
        for (const p of this.players) {
            if (samePlayer(p, player)) {
                p.phase = phase;
            }
        }
        if (this.player1 && samePlayer(this.player1, player)) {
            this.player1.phase = phase;
        }
        if (this.player2 && samePlayer(this.player2, player)) {
            this.player2.phase = phase;
        }
    }

    tryMove(player, i) {
        if (!player) return null;
    
        const homeLane = player.playerNumber === 1 ? 0 : 3;
        const midLane  = player.playerNumber === 1 ? 1 : 2;
        const pk = player.playerNumber === 1 ? "p1" : "p2";

        if (player.phase === 1) {
            if (this.board[i][midLane][pk] === 0 && this.board[i][homeLane][pk] > 0) {
                this.board[i][homeLane][pk]--;
                this.board[i][midLane][pk]++;
                return {
                    fromCol: i,
                    toCol: i,
                    fromRow: homeLane,
                    toRow: midLane,
                    playerNumber: player.playerNumber,
                };
            }
            return null;
        } else {
            if (this.board[i][midLane][pk] > 0) {
                this.board[i][midLane][pk]--;
                return {
                    fromCol: i,
                    toCol: null,
                    fromRow: midLane,
                    toRow: null,
                    playerNumber: player.playerNumber,
                };
            }
            if (this.board[i][homeLane][pk] > 0) {
                this.board[i][homeLane][pk]--;
                return {
                    fromCol: i,
                    toCol: null,
                    fromRow: homeLane,
                    toRow: null,
                    playerNumber: player.playerNumber,
                };
            }
            return null;
        }
    }

    allPlayedDown(player) {
        const homeLane = player.playerNumber === 1 ? 0 : 3;
        const midLane  = player.playerNumber === 1 ? 1 : 2;
        const pk = player.playerNumber === 1 ? "p1" : "p2";
        for (let i=0; i<6;i++) {
            if (this.board[i][homeLane][pk] != 1 && this.board[i][midLane][pk] != 1) {
                return false;
            }
        }
        return true;
    }

    gameOver() {
        const player1Won = this.board.every(row => row[0].p1 === 0 && row[1].p1 === 0);
        const player2Won = this.board.every(row => row[2].p2 === 0 && row[3].p2 === 0);
        return player1Won || player2Won;
    }

    endGame(player) {
        this.winner = player;
    }

    takeTurn() {
        this.rollDice(3);
        this.turnMoves = [];

        for (let i=0; i<3; i++) {
            let move = this.tryMove(this.currentPlayer, this.dice[i]-1);
            if (move !== null) {
                this.turnMoves.push(move);
                if (this.allPlayedDown(this.currentPlayer)) {
                    this.setPlayerPhase(this.currentPlayer, 2);
                }
                if (this.gameOver()) {
                    this.endGame(this.currentPlayer);
                }
            }
            else {
                // other player gets to use the move if possible
                move = this.tryMove(this.otherPlayer, this.dice[i]-1);
                if (move !== null) {
                    this.turnMoves.push(move);
                    if (this.allPlayedDown(this.otherPlayer)) {
                        this.setPlayerPhase(this.otherPlayer, 2);
                    }
                    if (this.gameOver()) {
                        this.endGame(this.otherPlayer);
                    }
                }
            }
        }
        if (this.winner) {
            return;
        }
        else {
            this.setCurrentPlayer(this.otherPlayer);
        }
    }
}

module.exports = Doblet;