import { Router } from "express";
import {
  forgotPassword,
  login,
  registerUser,
  resetPasswordGet,
  resetPasswordPost,
} from "../controllers/authController";
import { loggerMiddleware } from "../middleware/loggerMiddleware";

const router = Router();

router.post("/login", loggerMiddleware, login);
router.post("/register", loggerMiddleware, registerUser);
router.post("/forgot-password", loggerMiddleware, forgotPassword);
router.get("/reset-password/:id/:token", loggerMiddleware, resetPasswordGet);
router.post("/reset-password/:id/:token", loggerMiddleware, resetPasswordPost);

export default router;
