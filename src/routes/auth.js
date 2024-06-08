const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, authenticateChat } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               language_preference:
 *                 type: string
 *                 enum: [English, French, Fon, Yoruba]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Username or email already exists
 *       500:
 *         description: Server error
 */
router.post(
    '/register',
    [
        body('username').notEmpty().trim(),
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('language_preference').optional().isIn(['English', 'French', 'Fon', 'Yoruba']),
    ],
    authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Missing username or password
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post(
    '/login',
    [
        body('username').notEmpty().trim(),
        body('password').notEmpty().isLength({ min: 6 }),
    ],
    authController.login
);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh an access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout a user
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Server error
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/auth/forgotpassword:
 *   post:
 *     summary: Request a password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent with password reset instructions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: string
 *       404:
 *         description: No user found with that email
 *       500:
 *         description: Server error or email could not be sent
 */
router.post("/forgotpassword", authController.forgotPassword);

/**
 * @swagger
 * /api/auth/passwordreset/{resetToken}:
 *   put:
 *     summary: Reset a user's password
 *     parameters:
 *       - in: path
 *         name: resetToken
 *         required: true
 *         schema:
 *           type: string
 *         description: The reset token sent to the user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The new password
 *     responses:
 *       201:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */
router.put("/passwordreset/:resetToken", authController.resetPassword);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 languagePreference:
 *                   type: string
 *                 voicePreference:
 *                   type: string
 *                 imageGenerationStyle:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *   post:
 *     summary: Update the authenticated user's profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               languagePreference:
 *                 type: string
 *               voicePreference:
 *                 type: string
 *               imageGenerationStyle:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.route("/profile").get(authenticate, authController.profile).post(authenticate, authController.profile);

/**
 * @swagger
 * /api/user/{userId}:
 *   get:
 *     summary: Get user data by user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 languagePreference:
 *                   type: string
 *                 voicePreference:
 *                   type: string
 *                 imageGenerationStyle:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/user/:userId", authenticateChat, authController.user_data);

module.exports = router;