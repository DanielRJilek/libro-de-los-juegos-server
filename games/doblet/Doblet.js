/*
This represents the model of the game
*/

const Player = require('./Player');

class Doblet {
    constructor(id, player1, player2, currentPlayer, board) {
        // console.log(player1)
        this.id = id;
        this.player1 = player1;
        // console.log(this.player1)
        this.player2 = player2;
        this.board = board;
        this.winner = null;
        if (currentPlayer == this.player1.id) {
            this.currentPlayer = this.player1;
            // this.otherPlayer = this.player1 ? this.currentPlayer == this.player2 : this.player2;
            this.otherPlayer = this.player2;
        }
        else {
            this.currentPlayer = this.player2;
            // this.otherPlayer = this.player1 ? this.currentPlayer == this.player2 : this.player2;
            this.otherPlayer = this.player1;
        }
        // console.log(this.player1)
        // console.log(this.player2)
        // console.log(this.currentPlayer);
    }

    setup() {}

    // startingPlayer(player1, player2) {
    //     player1Roll = Math.random() * (6-1) + 1;
    //     player2Roll = Math.random() * (6-1) + 1;
    //     if (player1Roll == player2Roll) {
    //         return this.startingPlayer(player1,player2)
    //     }
    //     return player1 ? player1Roll > player2Roll : player2;
    // }

    setCurrentPlayer(player) {
        this.currentPlayer = player;
        this.otherPlayer = this.player1 ? this.currentPlayer == this.player2 : this.player2;
        
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
        // console.log(`i = ${i}`);
        if (player == this.player1) {
            if (player.phase == 1) {
                if (this.board[i][0] > 0) {
                    // console.log(this.board);
                    this.board[i][0]--;
                    this.board[i][1]++;
                    // console.log(this.board);
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                if (this.board[i][1] > 0) {
                    this.board[i][1]--;
                    return true;
                }
                else if (this.board[i][0] > 0) {
                    this.board[i][0]--;
                    return true;
                } 
                else {
                    return false;
                }
            }
        }
        else if (player == this.player2) {
            if (player.phase == 1) {
                if (this.board[i][3] > 0) {
                    this.board[i][3]--;
                    this.board[i][2]++;
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                if (this.board[i][2] > 0) {
                    this.board[i][2]--;
                    return true;
                }
                else if (this.board[i][3] > 0) {
                    this.board[i][3]--;
                    return true;
                } 
                else {
                    return false;
                }
            }
        }
    }

    allPlayedDown(player) {
        if (player == this.player1) {
            for (let i=0; i<6;i++) {
                if (this.board[i][1] != 1) {
                    return false;
                }
            }
        }
        else if (player == this.player2) {
            for (let i=0; i<6;i++) {
                if (this.board[i][2] != 1) {
                    return false;
                }
            }
        }
        return true;
    }

    gameOver() {
        for (let i=0; i<6;i++) {
            if (this.board[i][0] != 0 || this.board[i][3] != 0) {
                return false;
            }
        }
        return true;
    }

    endGame(player) {
        this.winner = player;
    }

    takeTurn() {
        const dice = this.rollDice(3);
        console.log(`dice: ${dice}`);
        for (let i=0; i<3; i++) {
            if (this.canMove(this.currentPlayer, dice[i]-1) == true) {
                if (this.allPlayedDown(this.currentPlayer)) {
                    this.currentPlayer.phase = 2;
                }
                else if (this.gameOver()) {
                    this.endGame(this.currentPlayer);
                }
            }
            else {
                // other player gets to use the move if possible
                if (this.canMove(this.otherPlayer, dice[i]-1) == true) {
                    if (this.allPlayedDown(this.otherPlayer)) {
                        this.otherPlayer.phase = 2;
                    }
                    else if (this.gameOver()) {
                        this.endGame(this.otherPlayer);
                    }
                }
            }
            // console.log(this.board);
        }
        if (this.winner) {
            return;
        }
        else {
            this.setCurrentPlayer(this.otherPlayer);
            // console.log(this.currentPlayer);
        }
    }


}

module.exports = Doblet;