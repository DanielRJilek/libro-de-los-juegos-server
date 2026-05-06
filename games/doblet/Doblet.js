/*
This represents the model of the game
*/

const Piece = require('./Piece');

class Doblet {
    constructor(id, players, board, currentPlayer) {
        this.id = id;
        this.players = players;
        this.board = board;
        this.winner = null;
        this.dice;
        this.currentPlayer = currentPlayer;
        for (let i=0; i < players.length; i++) {
            if (this.currentPlayer && players[i].username != this.currentPlayer.username) {
                this.otherPlayer = players[i];
            }
        }
    }

    setup() {
        const randomNumber = Math.floor(Math.random() * 2) + 1;
        if (randomNumber == 1) {
            this.currentPlayer = this.players[0];
            this.otherPlayer = this.players[1];
        }
        else {
            this.currentPlayer = this.players[1];
            this.otherPlayer = this.players[0];
        }
        for (let i=0; i<6; i++) {
            this.board[i][0].push(new Piece(this.players[0], 0));
            this.board[i][0].push(new Piece(this.players[0], 0));
            this.board[i][3].push(new Piece(this.players[1], 3));
            this.board[i][3].push(new Piece(this.players[1], 3));
        }
    }

    setCurrentPlayer(player) {
        this.currentPlayer = player;
        this.otherPlayer == this.player1 ? this.otherPlayer = this.player2 : this.otherPlayer = this.player1;
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

    canMove(player, i) {
        if (player == this.player1) {
            if (player.phase == 1) {
                if (this.board[i][1][0] == 0) {
                    this.board[i][0][0]--;
                    this.board[i][1][0]++;
                    return true;
                }
                else { return false; }           
            }
            else {
                if (this.board[i][1][0] > 0) {
                    this.board[i][1][0]--;
                    return true;
                }
                else if (this.board[i][0][0] > 0) {
                    this.board[i][0][0]--;
                    return true;
                } 
                else {return false;}
            }
        }
        else if (player == this.player2) {
            if (player.phase == 1) {
                if (this.board[i][2][0] == 0) {
                    this.board[i][3][0]--;
                    this.board[i][2][0]++;
                    return true;
                }
                else {return false;}
            }
            else {
                if (this.board[i][2][0] > 0) {
                    this.board[i][2][0]--;
                    return true;
                }
                else if (this.board[i][3][0] > 0) {
                    this.board[i][3][0]--;
                    return true;
                } 
                else {return false;}
            }
        }
    }

    allPlayedDown(player) {
        if (player == this.player1) {
            for (let i=0; i<6;i++) {
                if (this.board[i][0][0] != 1) {return false;}
            }
        }
        else if (player == this.player2) {
            for (let i=0; i<6;i++) {
                if (this.board[i][3][0] != 1) {return false;}
            }
        }
        return true;
    }

    gameOver() {
        const player1Won = this.board.every(row => row[0][0] === 0 && row[1][0] === 0);
        const player2Won = this.board.every(row => row[2][0] === 0 && row[3][0] === 0);
        return player1Won || player2Won;
    }

    endGame(player) {
        this.winner = player;
    }

    takeTurn() {
        console.log(`current player: ${this.currentPlayer.username}, other player: ${this.otherPlayer.username}`);
        this.dice = this.rollDice(3);
        for (let i=0; i<3; i++) {
            if (this.canMove(this.currentPlayer, this.dice[i]-1) == true) {
                if (this.allPlayedDown(this.currentPlayer)) {
                    this.currentPlayer.phase = 2;
                }
                else if (this.gameOver()) {
                    this.endGame(this.currentPlayer);
                }
            }
            else {
                // other player gets to use the move if possible
                if (this.canMove(this.otherPlayer, this.dice[i]-1) == true) {
                    if (this.allPlayedDown(this.otherPlayer)) {
                        this.otherPlayer.phase = 2;
                    }
                    else if (this.gameOver()) {
                        this.endGame(this.otherPlayer);
                    }
                }
            }
        }
        console.log(`Winner: ${this.winner}`);
        if (this.winner) {
            return;
        }
        else {
            this.setCurrentPlayer(this.otherPlayer);
            console.log(`current player: ${this.currentPlayer.username}, other player: ${this.otherPlayer.username}`);
            // console.log(this.board);
            // console.log(this.board[0][0], this.board[0][1], this.board[0][2], this.board[0][3]);
        }
    }
}

module.exports = Doblet;