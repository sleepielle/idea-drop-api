import express from "express";
import User from "../models/user.js";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../utils/getJWTSecret.js";
const router = express.Router();
import { generateToken } from "../utils/generateToken.js";

// @route           POST api/auth/register
// @description     Register new user
// @access          Public
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const existingUser = await User.findOne(email);
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({ name, email, password });

    //Create tokens
    const payload = { userId: user._id.toString() };
    const accessToken = generateToken(payload, "1m");
    const refreshToken = generateToken(payload, "30d");
    generateToken();

    //Set refresh token in HTTP-Only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// @route           POST api/auth/login
// @description     Authenticate user
// @access          Private
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    // Check if password matches
    const isMatch = await user.isMatch(password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    //Create tokens
    const payload = { userId: user._id.toString() };
    const accessToken = generateToken(payload, "1m");
    const refreshToken = generateToken(payload, "30d");
    generateToken();

    //Set refresh token in HTTP-Only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// @route           POST api/auth/logout
// @description     Logout  user and clear refresh token
// @access          Private
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  res.status(200).json({
    message: "Logged out successfully",
  });
});

// @route           POST api/auth/refresh
// @description     Generate new access token from refresh token
// @access          Public (Needs valid refresh token in cookie)
router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    console.log("Refreshing token...");

    if (!token) {
      res.status(401);
      throw new Error("No refresh token");
    }

    // Get payload to get userId to generate new access token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401);
      throw new Error("No user");
    }

    const newAccessToken = await generateToken(
      { userId: user._id.toString() },
      "1m"
    );

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(401);
    next(err);
  }
});

export default router;
