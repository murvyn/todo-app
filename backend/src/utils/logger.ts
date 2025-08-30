import { createLogger, transports, format } from "winston";
import "dotenv/config";

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.colorize(),
    }),
    new transports.File({ filename: "logger.log" }),
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: "exceptions.log" }),
  ],
  rejectionHandlers: [
    new transports.Console(),
    new transports.File({ filename: "exceptions.log" }),
  ],
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});
