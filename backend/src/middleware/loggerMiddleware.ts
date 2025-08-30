import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

type RequestWithTraceId = Request & { traceId: string };

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const traceId = randomUUID();
  const start = Date.now();
  const { method, originalUrl } = req;

  (req as RequestWithTraceId).traceId = traceId;

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    console.log(
      `[${traceId}] ${method} ${originalUrl} ${res.statusCode} - ${durationMs}`
    );
  });
  next();
};
