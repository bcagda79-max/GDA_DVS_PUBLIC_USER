import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("Missing JWT_SECRET environment variable.");
}

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const signJwt = (payload: Record<string, unknown>, options?: jwt.SignOptions) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: "7d", ...options });
};

export const verifyJwt = (token: string) => {
  try {
    return jwt.verify(token, jwtSecret) as Record<string, unknown>;
  } catch {
    return null;
  }
};
