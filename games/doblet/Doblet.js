/*
This represents the model of the game
*/

const { Piece } = require('./Piece');

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
    constructor(id, players, board, currentPlayer) {
        this.id = id;
        this.players = players;
        this.board = board;
        this.winner = null;
        this.dice;
        this.currentPlayer = currentPlayer;
        this.otherPlayer = null;
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
            this.board[i][0].push(new Piece(this.player1, 0));
            this.board[i][0].push(new Piece(this.player1, 0));
            this.board[i][3].push(new Piece(this.player2, 3));
            this.board[i][3].push(new Piece(this.player2, 3));
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
        const dice = [];
        for (let i=0;i<count;i++) {
            dice.push(this.getRandomInt(1,6));
        }
        return dice;
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

    canMove(player, i) {
        if (!player) return false;
        if (player.playerNumber == 1) {
            if (player.phase == 1) {
                if (this.board[i][1].length == 0) {
                    this.board[i][0].pop();
                    this.board[i][1].push(new Piece(player, 1));
                    return true;
                }
                else { return false; }           
            }
            else {
                if (this.board[i][1].length > 0) {
                    this.board[i][1].pop();
                    return true;
                }
                else if (this.board[i][0].length > 0) {
                    this.board[i][0].pop();
                    return true;
                } 
                else {return false;}
            }
        }
        else if (player.playerNumber == 2) {
            if (player.phase == 1) {
                if (this.board[i][2].length == 0) {
                    this.board[i][3].pop();
                    this.board[i][2].push(new Piece(player, 2));
                    return true;
                }
                else {return false;}
            }
            else {
                if (this.board[i][2].length > 0) {
                    this.board[i][2].pop();
                    return true;
                }
                else if (this.board[i][3].length > 0) {
                    this.board[i][3].pop();
                    return true;
                } 
                else {return false;}
            }
        }
    }

    allPlayedDown(player) {
        if (player.playerNumber == 1) {
            for (let i=0; i<6;i++) {
                if (this.board[i][0].length != 1 && this.board[i][1].length != 1) {
                    return false;
                }
            }
        }
        else if (player.playerNumber == 2) {
            for (let i=0; i<6;i++) {
                if (this.board[i][3].length != 1 && this.board[i][2].length != 1) {
                    return false;
                }
            }
        }
        return true;
    }

    gameOver() {
        const player1Won = this.board.every(row => row[0].length === 0 && row[1].length === 0);
        const player2Won = this.board.every(row => row[2].length === 0 && row[3].length === 0);
        return player1Won || player2Won;
    }

    endGame(player) {
        this.winner = player;
    }

    takeTurn() {
        this.dice = this.rollDice(3);
        for (let i=0; i<3; i++) {
            if (this.canMove(this.currentPlayer, this.dice[i]-1) == true) {
                if (this.allPlayedDown(this.currentPlayer)) {
                    this.setPlayerPhase(this.currentPlayer, 2);
                }
                if (this.gameOver()) {
                    this.endGame(this.currentPlayer);
                }
            }
            else {
                // other player gets to use the move if possible
                if (this.canMove(this.otherPlayer, this.dice[i]-1) == true) {
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