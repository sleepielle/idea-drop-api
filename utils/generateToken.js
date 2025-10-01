import { SignJWT } from "jose";
import { JWT_SECRET } from "./getJWTSecret";

export const generateToken = async (payload, expiresIn = "15m") => {
  return await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
};
