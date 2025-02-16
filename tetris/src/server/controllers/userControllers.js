const User = require("../models/userModel");

exports.getUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render('index', { user });
}