import {
  createTodo,
  deleteTodo,
  getTodos,
  markAsDone,
  updateTodo,
} from "../controllers/todoController";
import { authMiddleware } from "../middleware/authMiddleware";
import { loggerMiddleware } from "../middleware/loggerMiddleware";
import { Router } from "express";

const router = Router();

router.get("/", [authMiddleware, loggerMiddleware], getTodos);
router.post("/", [authMiddleware, loggerMiddleware], createTodo);
router.put("/:id", [authMiddleware, loggerMiddleware], updateTodo);
router.patch("/:id/complete", [authMiddleware, loggerMiddleware], markAsDone);
router.delete("/:id", [authMiddleware, loggerMiddleware], deleteTodo);

export default router;
