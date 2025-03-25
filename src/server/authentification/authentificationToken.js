const jwt = require("jsonwebtoken");

const verifyToken = (req, res) => {
  console.log("Cookies reçus :", req.cookies);

  let token = req.cookies.token;
  const refreshToken = req.cookies.refreshtoken;

  if (!token && refreshToken) {
    try {
      const verifyRefresh = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
      const newAccessToken = jwt.sign({ id: verifyRefresh.id, username: verifyRefresh.username },process.env.SECRET_KEY,{ expiresIn: "20m" });
      console.log("Nouveau access token généré");
      const cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 20*60*1000,
        path: '/'
      };
      res.cookie('token', newAccessToken, cookieOptions);
      token = newAccessToken;
    } 
    catch (error) {
      return res.status(401).json({ message: "Refresh token invalide ou expiré" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Accès refusé : token introuvable" });
  }

  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp && decoded.exp < Date.now() / 1000) {
      if (!refreshToken) {
        return res.status(401).json({ message: "Accès refusé : refresh token introuvable" });
      }
      try {
        const verifyRefresh = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
        const newAccessToken = jwt.sign({ id: verifyRefresh.id, username: verifyRefresh.username },process.env.SECRET_KEY,{ expiresIn: "20m" });
        console.log("Nouveau access token généré après expiration");
        const cookieOptions = {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 20*60*1000,
          path: '/'
        };
        res.cookie('token', newAccessToken, cookieOptions);
        req.user = verifyRefresh;
        return res.status(200).json({ message: "Tokens renouvelés avec succès", newAccessToken });
      } 
      catch (error) {
        return res.status(401).json({ message: "Refresh token invalide ou expiré" });
      }
    }
    // If token not expired, verify
    const verified = jwt.verify(token, process.env.SECRET_KEY);
    req.user = verified;
    return res.status(200).json({ message: "Token vérifié avec succès" });
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré", error: error.message });
  }
};

module.exports = { verifyToken };