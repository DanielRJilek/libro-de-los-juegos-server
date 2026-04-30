/*
This represents the model of the game
*/

class Doblet {
    constructor(id, player1, player2, currentPlayer, board) {
        this.id = id;
        this.player1 = player1;
        this.player2 = player2;
        this.board = board;
        this.winner = null;
        this.otherPlayer;
        this.dice;
        if (currentPlayer._id == this.player1._id) {
            this.currentPlayer = this.player1;
            // this.otherPlayer = this.player1 ? this.currentPlayer == this.player2 : this.player2;
            this.otherPlayer = this.player2;
        }
        else {
            this.currentPlayer = this.player2;
            // this.otherPlayer = this.player1 ? this.currentPlayer == this.player2 : this.player2;
            this.otherPlayer = this.player1;
        }
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
        if (player == this.player1) {
            if (player.phase == 1) {
                if (this.board[i][1] == 0) {
                    this.board[i][0]--;
                    this.board[i][1]++;
                    return true;
                }
                else { return false; }           
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
                else {return false;}
            }
        }
        else if (player == this.player2) {
            if (player.phase == 1) {
                if (this.board[i][2] == 0) {
                    this.board[i][3]--;
                    this.board[i][2]++;
                    return true;
                }
                else {return false;}
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
                else {return false;}
            }
        }
    }

    allPlayedDown(player) {
        if (player == this.player1) {
            for (let i=0; i<6;i++) {
                if (this.board[i][0] != 1) {return false;}
            }
        }
        else if (player == this.player2) {
            for (let i=0; i<6;i++) {
                if (this.board[i][3] != 1) {return false;}
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
        if (this.winner) {
            return;
        }
        else {
            console.log(`current player: ${this.currentPlayer.username}, other player: ${this.otherPlayer.username}`);
            this.setCurrentPlayer(this.otherPlayer);
            console.log(`current player: ${this.currentPlayer.username}, other player: ${this.otherPlayer.username}`);
        }
    }
}

module.exports = Doblet;