/*
This represents the controller of the game
*/

const Player = require('./Player');

class Doblet {
    constructor(id, player1, player2, currentPlayer, otherPlayer, winners) {
        this.player1 = new Player(player1.username);
        this.player2 = new Player(player2.username);
        this.currentPlayer = currentPlayer;
        this.otherPlayer = otherPlayer;
        this.id = id;
        this.winner = winner;
    }

    setup() {   
    }

    startingPlayer(player1, player2) {
        player1Roll = Math.random() * (6-1) + 1;
        player2Roll = Math.random() * (6-1) + 1;
        if (player1Roll == player2Roll) {
            return this.startingPlayer(player1,player2)
        }
        return player1 ? player1Roll > player2Roll : player2;
    }

    setCurrentPlayer(player) {
        this.currentPlayer = player;
        this.otherPlayer = this.player1 ? this.currentPlayer == this.player2 : this.player2;
    }

    rollDice(count) {
        const dice = [];
        for (let i=0;i<count;i++) {
            dice.push(Math.random() * (6-1) + 1);
        }
        return dice;
    }

    canMove(player, point) {

    }

    play() {

    }

    allPlayedDown(player) {
        for (let i=0; i<6;i++) {
            if (player.Board.points[i][1] != 1) {
                return false;
            }
        }
        return true;
    }

    gameOver() {
        for (let i=0; i<6;i++) {
            if (this.player1.Board.points[i][0] != 0 || this.player2.Board.points[i][0] != 0) {
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
        for (let i=0; i<3; i++) {
            if (this.canMove(this.currentPlayer, i)) {
                if (this.allPlayedDown(this.currentPlayer)) {
                    this.currentPlayer.phase = 2;
                }
                else if (this.gameOver()) {
                    this.endGame(this.currentPlayer);
                }
            }
            else {
                // other player gets to use the move if possible
                if (this.canMove(this.otherPlayer, i)) {
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
            this.setCurrentPlayer(this.otherPlayer);
        }
    }


}

module.exports = Doblet;