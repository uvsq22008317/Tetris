const Logout = (req, res) => {
    // Use clearCookie method to delete the cookie named "token"
    res.clearCookie("token", {
        // httpOnly prevents access to the cookie from the browser's JavaScript
        httpOnly: true,
        secure: false,
        sameSite: "lax",});
    return res.status(200).json({ message: "Déconnexion réussie" });
    };

module.exports = { Logout };
  
