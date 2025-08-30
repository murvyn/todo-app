import compression from "compression";
import cors, { CorsOptions } from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import { logger } from "./utils/logger";
import "dotenv/config";
import passport from "passport";
import auth from "./routes/authRoutes";
import todos from "./routes/todoRoutes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const corsOptions: CorsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", auth);
app.use("/api/todos", todos);

const port = 5000;
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
