const RefreshToken = require("../models/refreshModel");
const bcrypt = require("bcrypt");

const Logout = async (req, res) => {
    try {
        const refreshtoken= req.cookies.Refreshtoken;
        if (!refreshtoken) {
            return res.status(400).json({ message: "Token refresh manquant" });
        }
        // Hash the token to match with the one in database
        const hashedToken = await bcrypt.hash(refreshtoken.toString(), 10);

        // Delete token
        await RefreshToken.deleteOne({ token: hashedToken });
        // Delete cookie of token and refresh token
        res.clearCookie("token");
        res.clearCookie("refreshtoken");
    
        return res.status(200).json({ message: "Déconnexion réussie" });
    } 
    catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
    return res.status(500).json({ message: "Erreur serveur" });
    }
};

module.exports = { Logout };
  
