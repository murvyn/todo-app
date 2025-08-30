import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();
export const getTodos = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [todos, totalCount] = await Promise.all([
      prisma.todo.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.todo.count({ where: { userId } }),
    ]);

    res.status(200).json({
      todos,
      totalCount,
      hasMore: skip + limit < totalCount,
      message: "Todos retrieved successfully.",
    });
  } catch (error) {
    logger.error("Error fetching todos:", error);
    res.status(500).json({
      message: "Failed to fetch todos",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createTodo = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id;
    const { title, description } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const newTodo = await prisma.todo.create({
      data: {
        title,
        description,
        userId,
      },
    });

    res.status(201).json({
      todo: newTodo,
      message: "Todo created successfully.",
    });
  } catch (error) {
    logger.error("Error creating todo:", error);
    res.status(500).json({
      message: "Failed to create todo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateTodo = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id;
    const { title, description } = req.body;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        title,
        description,
        userId,
      },
    });

    res.status(200).json({
      todo: updatedTodo,
      message: "Todo updated successfully.",
    });
  } catch (error) {
    logger.error("Error updating todo:", error);
    res.status(500).json({
      message: "Failed to update todo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteTodo = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await prisma.todo.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Todo deleted successfully.",
    });
  } catch (error) {
    logger.error("Error deleting todo:", error);
    res.status(500).json({
      message: "Failed to delete todo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const markAsDone = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const todo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        completed: !todo.completed,
        userId,
      },
    });

    res.status(200).json({
      todo: updatedTodo,
      message: "Todo marked as done successfully.",
    });
  } catch (error) {
    logger.error("Error marking todo as done:", error);
    res.status(500).json({
      message: "Failed to mark todo as done",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
