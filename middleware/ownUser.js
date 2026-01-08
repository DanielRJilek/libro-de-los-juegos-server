const asyncHandler = require('express-async-handler');

const ownUser = (req,res,next) => {
    console.log(req.params.userid);
    const claimedID = req.params.userid;
    if (claimedID != req.user.id) {
        return res.status(403).json({message: "Forbidden"});
    }
    next();
}

module.exports = ownUser