const mongoose = require("mongoose");
require("dotenv").config();

const DB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected !");
    } catch (error) {
        console.error("MongoDB connection error : ", error);
        process.exit(1);
    }
};

module.exports = DB;