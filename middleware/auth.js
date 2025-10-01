import { jwtVerify } from "jose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { JWT_SECRET } from "../utils/getJWTSecret.js";
dotenv.config();

export const protect = async (req, res, next) => {
  try {
    // Get refreshToken from Header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      res.status(401);
      throw new Error("Not authorized. No Token");
    }

    // Split token bc it starts with word Bearer. Index 1 has the token value
    const token = authHeader.split(" ")[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const user = await User.findById(payload.userId).select("_id name email");

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.status(401);
    next(new Error("Not authorized, token failed"));
  }
};
