const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Indexed to make database queries fast when verifying tokens
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'mentor', 'recruiter', 'admin']
    },
    // Conditional profile slots dynamically captured based on chosen role matrix
    college: { type: String, trim: true },
    expertise: { type: String, trim: true },
    company: { type: String, trim: true }
}, {
    timestamps: true // Automatically generates createdAt and updatedAt values
});

module.exports = mongoose.model('User', UserSchema);