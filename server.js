import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import ideasRouter from "./routes/idea.js";
import authRouter from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";

//starting dotenv to use env variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8800;

// Connect to MongoDb
connectDB();

//starting middleware
app.use(cors());
//get raw json in body
app.use(express.json());

// ? using built-in middleware, which parses the data coming from application/x-www-form-urlenconded and makes the parsed data available under req.body, so we dont use things like json.stringify
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//Routes
app.use("/api/ideas", ideasRouter);
app.use("/api/auth", authRouter);

// 404 fallback to avoid html return errors
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
