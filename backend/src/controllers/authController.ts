import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  generateAuthToken,
} from "../utils/helper";
import { logger } from "../utils/logger";
import jwt from "jsonwebtoken";
import { createTransport } from "nodemailer";
import "dotenv/config";

const prisma = new PrismaClient();
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.error("Email and password are required");
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      logger.error("User not found");
      return res.status(404).json({
        message: "User not found. Would you like to create an account?",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.error("Invalid credentials");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateAuthToken(user);
    res.cookie("auth-x-token", token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    logger.error(`Error in login: ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email, password } = req.body;
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    const token = generateAuthToken(newUser);
    res.cookie("auth-x-token", token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
    });
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    logger.error(`Error in user registration: ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.body;
    if (!email) {
      logger.error("Email are required");
      return res.status(400).json({ message: "Email are required" });
    }

    const user = await prisma.user.findFirst({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found. Would you like to create an account?",
      });
    }

    const secret = process.env.jwtPrivateKey! + user.password;
    const token = jwt.sign({ email: user.email, id: user.id }, secret, {
      expiresIn: "5m",
    });
    const link = `${process.env.FRONTEND_URL}/reset-password?userId=${user.id}&token=${token}`;

    const transporter = createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_ADDRESS!,
        pass: process.env.EMAIL_PASSWORD!,
      },
    });

    const emailOptions = {
      from: process.env.EMAIL_ADDRESS!,
      to: user.email,
      subject: "Reset Password",
      html: `
      <p>Hello,</p>
      <p>We received a request to reset the password for your account. Please click the link below to reset your password:</p>
      <a href="${link}">Reset Password</a>
      <p>This link will expire in 5 minutes for security reasons. If you didn't request this password reset, you can safely ignore this email.</p>
      <p>Thank you,<br>Team</p>
    `,
    };

    await transporter.sendMail(emailOptions);
    res.json({ message: "Password reset link sent" }).status(200);
  } catch (error) {
    logger.error(`Error in forgot password: ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPasswordGet = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { token, id } = req.params;
  if (!id || !token) {
    return res.status(400).json({ message: "Invalid id or token" });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const secret = process.env.jwtPrivateKey! + user.password;
  try {
    const verify = jwt.verify(token, secret);
    res
      .status(200)
      .json({ message: "Password reset link is valid", user: verify });
  } catch (error) {
    logger.error(`Error in reset password: ${(error as Error).message}`);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const resetPasswordPost = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id, token } = req.params;
  if (!id || !token) {
    return res.status(400).json({ message: "Invalid id or token" });
  }
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const secret = process.env.jwtPrivateKey! + user.password;
  try {
    const verify = jwt.verify(token, secret);
    if (!verify) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    res.json({ message: "Password reset successful" }).status(200);
  } catch (error) {
    logger.error(`Error in reset password: ${(error as Error).message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};




