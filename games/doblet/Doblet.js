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
                console.log("Invalid player number");
            }
        }
        if (this.player1 && this.player2 && currentPlayer) {
            this.otherPlayer = samePlayer(currentPlayer, this.player1) ? this.player2 : this.player1;
            console.log(`Other player: ${this.otherPlayer.username}`);
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
        console.log(this.board)
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

    canMove(player, i) {
        if (!player) return false;
        console.log(`Checking if player ${player.playerNumber} can move on column ${i}`);
        console.log(`Player phase: ${player.phase}`);
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
                console.log("Player is in phase 2");
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
            console.log("Checking if all pieces are played down for player 1");
            for (let i=0; i<6;i++) {
                console.log(`Checking if column ${i} has 1 piece for player 1`);
                if (this.board[i][0].length != 1 && this.board[i][1].length != 1) {
                    console.log(`Column ${i} does not have 1 piece for player 1`);
                    return false;
                }
            }
        }
        else if (player.playerNumber == 2) {
            console.log("Checking if all pieces are played down for player 2");
            for (let i=0; i<6;i++) {
                console.log(`Checking if column ${i} has 1 piece for player 2`);
                if (this.board[i][3].length != 1 && this.board[i][2].length != 1) {
                    console.log(`Column ${i} does not have 1 piece for player 2`);
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
        console.log("New turn:")
        console.log(`current player: ${this.currentPlayer.username}, other player: ${this.otherPlayer.username}`);
        console.log(`Current player phase: ${this.currentPlayer.phase}, Other player phase: ${this.otherPlayer.phase}`);
        this.dice = this.rollDice(3);
        for (let i=0; i<3; i++) {
            console.log(`Dice: ${this.dice[i]}`);
            if (this.canMove(this.currentPlayer, this.dice[i]-1) == true) {
                console.log(`Player ${this.currentPlayer.username} can move on column ${this.dice[i]-1}`);
                if (this.allPlayedDown(this.currentPlayer)) {
                    console.log(`Player ${this.currentPlayer.username} has all pieces played down, moving to phase 2`);
                    this.currentPlayer.phase = 2;
                }
                else if (this.gameOver()) {
                    console.log(`Game over, winner: ${this.currentPlayer.username}`);
                    this.endGame(this.currentPlayer);
                }
            }
            else {
                // other player gets to use the move if possible
                if (this.canMove(this.otherPlayer, this.dice[i]-1) == true) {
                    console.log(`Player ${this.otherPlayer.username} can move on column ${this.dice[i]-1}`);
                    if (this.allPlayedDown(this.otherPlayer)) {
                        console.log(`Player ${this.otherPlayer.username} has all pieces played down, moving to phase 2`);
                        this.otherPlayer.phase = 2;
                    }
                    else if (this.gameOver()) {
                        console.log(`Game over, winner: ${this.otherPlayer.username}`);
                        this.endGame(this.otherPlayer);
                    }
                }
            }
        }
        if (this.winner) {
            console.log(`Game over, winner: ${this.winner.username}`);
            return;
        }
        else {
            this.setCurrentPlayer(this.otherPlayer);
        }
        console.log(`New current player: ${this.currentPlayer.username}`);
    }
}

module.exports = Doblet;