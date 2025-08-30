import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

export const generateAuthToken = (user: User) => {
  const jwtPrivateKey = process.env.jwtPrivateKey;

  if (!jwtPrivateKey) {
    throw new Error("jwtPrivateKey environment variable not set");
  }
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    jwtPrivateKey
  );
};
