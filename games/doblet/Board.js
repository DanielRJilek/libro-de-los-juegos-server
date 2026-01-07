/*
Note that 'points' in table games are equivalent to 'squares' in chess. They have nothing to do with scoring.
*/
class Board {
    constructor() {
        this.points =   [2,0],
                        [2,0],
                        [2,0],
                        [2,0],
                        [2,0],
                        [2,0];
    }
}

module.exports = Board;