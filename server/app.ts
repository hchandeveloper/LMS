// Setup and imports
require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import { rateLimit } from 'express-rate-limit';
import { newPayment } from "./controllers/order.controller";
import { isAutheticated } from "./middleware/auth";

// Body parser
app.use(express.json({ limit: "50mb" }));

// Cookie parser
app.use(cookieParser());

// CORS setup
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// API requests rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: 'draft-7', 
    legacyHeaders: false, 
});

// Routes setup
app.use("/api/v1", userRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", analyticsRouter);
app.use("/api/v1", layoutRouter);

// Register newPayment route with corrected path
app.use("/api/v1/payment", isAutheticated, newPayment);

// Testing API endpoint
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

// Unknown route handler
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// Middleware calls
app.use(limiter);
app.use(ErrorMiddleware);
