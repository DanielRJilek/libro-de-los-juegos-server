const GameInstance = require('../models/GameInstance');

const isPlayer = async (req,res,next) => {
    const instance = req.params.instance;
    const userID = req.user.id;
    const inGame = await GameInstance.find({    _id: instance,
                                        players: {"$in": userID}})
    if (!inGame) {
        return res.status(403).json({message: "Forbidden"});
    }
    next();
}

module.exports = isPlayer