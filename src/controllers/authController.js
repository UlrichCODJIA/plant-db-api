const jwt = require('jsonwebtoken');
const crypto = require("crypto");

const User = require('../models/User');
const logger = require('../utils/logger');
const sendEmail = require("../utils/sendEmail");

/**
 * Register a new user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.register = async (req, res) => {
    const { username, email, password, language_preference } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const user = new User({
            username,
            email,
            password,
            languagePreference: language_preference || 'English',
        });

        await user.save();

        const { accessToken, refreshToken } = user.getSignedJwtToken();

        res.status(201).json({ success: true, accessToken, refreshToken });
    } catch (err) {
        logger.error('Failed to register user:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Login a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.login = async (req, res) => {
    const { username, password } = req.body;

    // Check if email and password is provided
    if (!username || !password) {
        res.status(400).json({ error: 'Please provide an email and password' });
    }

    try {
        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = user.getSignedJwtToken();

        res.json({ sucess: true, accessToken, refreshToken });
    } catch (err) {
        logger.error('Failed to login:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Refresh an access token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const tokens = user.getSignedJwtToken();

        res.json({ sucess: true, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    } catch (err) {
        logger.error('Failed to refresh token:', err);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};

/**
 * Get or update user profile.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.profile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (req.method === 'POST') {
            const data = req.body;
            const allowedFields = [
                'email',
                'firstName',
                'lastName',
                'languagePreference',
                'voicePreference',
                'imageGenerationStyle',
            ];

            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    user[field] = data[field];
                }
            });

            await user.save();
            return res.json({ message: 'Profile updated successfully' });
        }

        res.json({
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            languagePreference: user.languagePreference,
            voicePreference: user.voicePreference,
            imageGenerationStyle: user.imageGenerationStyle,
        });
    } catch (err) {
        logger.error('Failed to get/update profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get user's datas.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.user_data = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        logger.error('Failed to get/update profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Request a password reset.
 *
 * @param {Object} req - The request object containing the email.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');

        if (!user) {
            res.status(404).json({ error: "No email could not be sent" });
        }

        // Reset Token Gen and add to database hashed (private) version of token
        const resetToken = user.getResetPasswordToken();

        await user.save();

        // Create reset url to email to provided email
        const resetUrl = `${process.env.BASE_URL || "http://localhost:3000"}/api/auth/passwordreset/${resetToken}`;

        // HTML Message
        const message = `
        <h1>You have requested a password reset</h1>
        <p>Please make a put request to the following link:</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset Request",
                text: message,
            });

            res.status(200).json({ success: true, data: "Email Sent" });
        } catch (err) {
            logger.error(err);

            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            res.status(500).json({ error: 'Email could not be sent' });
        }
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Reset a user's password using a valid reset token.
 *
 * @param {Object} req - The request object containing the reset token and new password.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.resetPassword = async (req, res) => {
    // Compare token in URL params to hashed token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            res.status(400).json({ error: 'Invalid Token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(201).json({
            success: true,
            data: "Password Updated Success",
            token: user.getSignedJwtToken(),
        });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Logout a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.logout = async (req, res) => {
    try {
        const jti = req.jti;
        const redisClient = req.redisClient;

        const expiresIn = process.env.JWT_EXPIRATION || 3600;
        await redisClient.set(jti, 'blacklisted', { EX: expiresIn });

        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        logger.error('Failed to logout:', err);
        res.status(500).json({ error: 'Server error' });
    }
};