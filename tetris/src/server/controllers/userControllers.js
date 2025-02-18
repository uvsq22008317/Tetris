const { createUser, findUserById } = require("../services/userService");

const createUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser(username, hashedPassword);

        res.status(201).json({ message: "User create successfully !", user: { newUser }});
    } catch (error) {
        res.status(500).json({ message: "Failed to create user !", error: error.message});
    }
}

const deleteUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await findUserById(userId);
        if(!user) {
            return res.status(404).json({ message: "User not found !" });
        }

        await user.deleteUser(userId);
        res.status(201).json({ message: "user delete with success !" });
    } catch (error) {
        res.status(500).json({ message: "error deleting user !", error })
    }
}

module.exports = { createUser, deleteUserById };