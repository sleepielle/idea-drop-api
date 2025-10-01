import dotenv from "dotenv";
dotenv.config(); //so we can access to the secret

export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
