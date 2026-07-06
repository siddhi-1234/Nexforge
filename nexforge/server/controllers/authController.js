const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.firebaseLogin = async (req, res) => {

    try {

        const { token } = req.body;

        const decoded = await admin.auth().verifyIdToken(token);

        let user = await User.findOne({
            email: decoded.email
        });

        if (!user) {

            user = await User.create({

                name: decoded.name,

                email: decoded.email,

                picture: decoded.picture,

                provider: "google"

            });

        }

        const appToken = jwt.sign(

            {
                id: user._id
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );

        res.json({

            token: appToken,

            user

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: err.message

        });

    }

};