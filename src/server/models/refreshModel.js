const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  user: { type: String, required: true },
  token: {type: String,required: true},
  expires: {type: Date,required: true},
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);