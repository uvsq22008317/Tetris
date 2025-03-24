const { findUserByUsername } = require("../services/userService");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const RefreshToken = require("../models/refreshModel");

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Search user by username
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé !" });
    }
    
    // Comparing the entered password with the stored hashed password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Mot de passe incorrect !" });
    }
    await RefreshToken.deleteMany({user: user._id});

    const accessToken = jwt.sign({id: user._id, username: user.username}, process.env.SECRET_KEY, {expiresIn: "20m"});
    const refreshToken = jwt.sign({id: user._id, username: user.username}, process.env.REFRESH_SECRET_KEY, {expiresIn: "7d"});
    const hashRefreshToken = await bcrypt.hash(refreshToken, 10);

    const expires = new Date(Date.now() +7*24*60*60*1000);
    const newRefreshToken = new RefreshToken({
      user: user._id,
      token: hashRefreshToken,
      expires
    });
    await newRefreshToken.save();


    // Define cookie options for the access token
    const cookieOptions= {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 20*60*1000,
      path: '/'};
    res.cookie('token', accessToken, cookieOptions);

    // Define cookie options for the refresh token
    const cookieOptionsrefresh= {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7*24*60*60*1000,
      path: '/'};
    res.cookie('refreshtoken', refreshToken, cookieOptionsrefresh);

    
    return res.status(200).json({ message: "Connexion réussie !" });
  } 
  catch (error) {
    console.error("Erreur dans loginUser :", error);
    return res.status(500).json({ message: "Erreur lors de la connexion", error: error.message });
  }
  };

module.exports = { loginUser };
