const jwt = require("jsonwebtoken");
const schema = require("../models/User");
const bcrypt = require("bcrypt");
require("dotenv").config();

const SALT_ROUNDS = 10;
const JWT_EXPIRY = "1h";
const COOKIE_EXPIRY = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Input validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Check for existing user
        const existingUser = await schema.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Account already exists"
            });
        }

        // Hash password
        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = await schema.create({
            firstName,
            lastName,
            email,
            password: hash
        });

        // Remove password from response
        user.password = undefined;

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during signup"
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await schema.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Create JWT payload
        const payload = {
            email: user.email,
            id: user._id,
            role: user.role // If you have role-based authentication
        };

        // Generate token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: JWT_EXPIRY
        });

        // Prepare user object for response
        const userResponse = user.toObject();
        delete userResponse.password;

        // Set cookie options
        const cookieOptions = {
            expires: new Date(Date.now() + COOKIE_EXPIRY),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Secure in production
            sameSite: "strict"
        };

        // Set cookie
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            token,
            user: userResponse,
            message: "Logged in successfully"
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during login"
        });
    }
};