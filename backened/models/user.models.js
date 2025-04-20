import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    birthDate: {
        type: Date,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    residence: {
        type: String,
        required: true,
    },
    licenceFront: {
        type: String, // Store file path
    },
    licenceBack: {
        type: String, // Store file path
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
    role: {
        type: String,
        enum: ["Admin", "Customer"],
        default: "Customer",
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
    },
    accountLockedUntil: {
        type: Date,
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
