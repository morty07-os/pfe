import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    birthDate: {
        type: Date,
        required: [true, 'Birth date is required']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        unique: true
    },
    residence: {
        type: String,
        required: [true, 'Residence is required'],
        trim: true
    },
    licenceFront: {
        type: String,
        required: [true, 'Front of driving licence is required']
    },
    licenceBack: {
        type: String,
        required: [true, 'Back of driving licence is required']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: { // Add status field
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verificationToken: String,
    verificationTokenExpires: Date,
    refreshToken: String
}, {
    timestamps: true
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
