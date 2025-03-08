import mongoose from "mongoose";

const PasswordSchema = new mongoose.Schema({
  website: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  QuestionName: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Password ||
  mongoose.model("Password", PasswordSchema);
