import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImg: {
        type: String,
        default: "",
    },
    verified: {
        type: Boolean,
        default: false,
    },
    phoneNumber: {
        type: String,
        unique: true,
    },
    referralCode: {
        type: String,
        unique: true,
    },
    referredBy: {
        type: String,
    },
  },
  { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
