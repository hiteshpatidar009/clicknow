/**
 * Photography App Backend Server
 * Main entry point
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Config and database
import { appConfig } from "./config/index.js";
import { firebaseDatabase } from "./database/index.js";

// Routes
import routes from "./routes/index.js";

// Middlewares
import {
  notFoundHandler,
  errorHandler,
  defaultLimiter,
  requestLoggerWithExclusions,
} from "./middlewares/index.js";

// Utils
import Logger from "./utils/logger.util.js";

// Initialize express app
const app = express();

/**
 * Initialize server
 */
async function initializeServer() {
  try {
    // Initialize Firebase
    Logger.info("Initializing Firebase connection...");
    await firebaseDatabase.initialize();
    Logger.info("Firebase initialized successfully");

    // Trust proxy (for rate limiting behind reverse proxy)
    app.set("trust proxy", 1);

    // Security middleware
    app.use(
      helmet({
        contentSecurityPolicy: false, // Disable for API
        crossOriginEmbedderPolicy: false,
      }),
    );

    // CORS configuration
    app.use(
      cors({
        origin: appConfig.cors.origins,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        credentials: true,
        maxAge: 86400, // 24 hours
      }),
    );

    // Body parsing
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Compression
    app.use(compression());

    // HTTP request logging (development)
    if (process.env.NODE_ENV !== "production") {
      app.use(morgan("dev"));
    }

    // Custom request logging
    app.use(requestLoggerWithExclusions(["/api/v1/health"]));

    // Rate limiting
    app.use("/api", defaultLimiter);

    // API routes
    app.use("/api/v1", routes);

    // Root endpoint
    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Photography App API",
        version: "1.0.0",
        documentation: "/api/v1/docs",
      });
    });

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
      });
    });

    // 404 handler
    app.use(notFoundHandler);

    // Global error handler
    app.use(errorHandler);

    // Start server
    const PORT = appConfig.port;
    const server = app.listen(PORT, () => {
      Logger.info(`Server started on port ${PORT}`);
      Logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      Logger.info(`API URL: http://localhost:${PORT}/api/v1`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      Logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(() => {
        Logger.info("HTTP server closed");
        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        Logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 30000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      Logger.error("Uncaught Exception", error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      Logger.error("Unhandled Rejection", { reason, promise });
    });

    return server;
  } catch (error) {
    Logger.error("Failed to initialize server", error);
    process.exit(1);
  }
}

// Start the server
initializeServer();

export default app;
