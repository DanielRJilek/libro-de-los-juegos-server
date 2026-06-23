const GameInstance = require('../models/GameInstance');

const isPlayer = async (req,res,next) => {
    const instance = req.params.instance;
    const userID = req.user.id;
    const gameDoc = await GameInstance.findById(instance).lean();
    const inGame = gameDoc?.players?.some(
        p => p?._id && String(p._id) === String(userID)
    );
    if (!inGame) {
        return res.status(403).json({message: "Forbidden"});
    }
    next();
}

module.exports = isPlayer
