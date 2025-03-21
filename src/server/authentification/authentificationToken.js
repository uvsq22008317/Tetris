const jwt = require("jsonwebtoken");

const verifyToken = (req, res) => {
  // Extract cookie token from request
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Accès refusé : token introuvable" });
  }
  try {
    // Verify and decode token using jwtsecret defined in the .env filei, if the token is valid, jwt.verify returns its decoded contents
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return res.status(200).json({ message: "Token vérifié avec succès" });
    } 
    catch (error) {
    console.error("Erreur pendant la vérification du token :", error);
    return res.status(401).json({ message: "Token invalide ou expiré" });
    }
};

module.exports = {verifyToken};