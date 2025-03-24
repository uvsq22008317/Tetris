const jwt = require("jsonwebtoken");

const verifyToken = (req, res) => {
  // Extract cookie token from request
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Accès refusé : token introuvable" });
  }
  try {
    const decod = jwt.decode(token);

    // Check if access token expired
    if (decod && decod.exp && decod.exp < Date.now() / 1000) {
      // Access token expired check refresh token
      const refreshToken = req.cookies.refreshtoken;

      if (!refreshToken) {
        return res.status(401).json({ message: "Accès refusé : refresh token introuvable" });
      }

    try {
      // Check refresh token
      const verifyRefresh = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);

      // New access token
      const newAccessToken = jwt.sign({ id: verifyRefresh.id, username: verifyRefresh.username },process.env.SECRET_KEY,{ expiresIn: "20m" }
);

      // Define cookie options for the access token
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 20*60*1000,
        path: '/'
      };
      
      res.cookie('token', newAccessToken, cookieOptions);
      req.user = verifyRefresh;
    }
    catch (error) {
      console.error("Erreur pendant la vérification du refresh token :", error);
      return res.status(401).json({ message: "Refresh token invalide ou expiré" });
    }
  }
    // Verify and decode token using jwtsecret defined in the .env filei, if the token is valid, jwt.verify returns its decod contents
    const verify = jwt.verify(token, process.env.SECRET_KEY);
    req.user = verify;
    return res.status(200).json({ message: "Token vérifié avec succès" });
    } 
    catch (error) {
    console.error("Erreur pendant la vérification du token :", error);
    return res.status(401).json({ message: "Token invalide ou expiré" });
    }
};

module.exports = {verifyToken};