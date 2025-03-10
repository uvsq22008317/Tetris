const { findUserByUsername } = require("../services/userService");
const bcrypt = require("bcrypt");

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Search user by username
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé !" });
    }
    
    // Comparing the entered password with the stored hashed password
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error("Erreur lors de la comparaison des mots de passe :", err);
        return res.status(500).json({ message: "Erreur lors de la connexion", error: err });
      }
      if (result) {
        // Passwords match = authentication successful
        console.log("Mot de passe correct! Utilisateur authentifié.");
        return res.status(200).json({ message: "Connexion réussie !" });
      } else {
        // Passwords don't match: authentication failed
        console.log("Mot de passe incorrect! Authentication échoué.");
        return res.status(401).json({ message: "Mot de passe incorrect !" });
      }
    });
  } catch (error) {
    console.error("Erreur dans loginUser :", error);
    return res.status(500).json({ message: "Erreur lors de la connexion", error: error.message });;
  }
};

module.exports = { loginUser };
