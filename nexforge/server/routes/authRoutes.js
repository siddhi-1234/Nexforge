const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyFirebaseToken = require('../middleware/authMiddleware');


router.post('/signup', verifyFirebaseToken, async (req, res) => {
    try {
        const { uid, name, email, role, college, expertise, company } = req.body;

        // Security Check: Verify that the decoded token UID matches the body data payload
        if (req.user.uid !== uid) {
            return res.status(403).json({ message: "Security Mismatch: Identity validation failed." });
        }

        // Check if user already exists in MongoDB
        let user = await User.findOne({ firebaseUid: uid });
        if (user) {
            return res.status(200).json({ message: "User records verified successfully.", user });
        }

        // Structure a clean user object based on roles
        user = new User({
            firebaseUid: uid,
            name,
            email,
            role,
            college: role === 'student' ? college : undefined,
            expertise: role === 'mentor' ? expertise : undefined,
            company: role === 'recruiter' ? company : undefined
        });

        await user.save();
        res.status(201).json({ message: "User profile securely forged in MongoDB.", user });
    } catch (err) {
        res.status(500).json({ message: "Database initialization error.", error: err.message });
    }
});


router.post('/login', verifyFirebaseToken, async (req, res) => {
    try {
        // Find user by decoded token parameters passed from middleware context wrapper
        const user = await User.findOne({ firebaseUid: req.user.uid });

        if (!user) {
            return res.status(404).json({ message: "Profile attributes missing in database schemas." });
        }

        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: "Database transactional error.", error: err.message });
    }
});

module.exports = router;