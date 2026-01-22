import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import env from "../config/env.loader.js";

import { appConfig } from "../config/index.js";
import { firebaseDatabase } from "../database/index.js";

import routes from "../routes/index.js";

import {
  notFoundHandler,
  errorHandler,
  defaultLimiter,
  requestLoggerWithExclusions,
} from "../middlewares/index.js";

import Logger from "../utils/logger.util.js";

const app = express();

/**
 * Initialize server
 */
async function initializeServer() {
  try {
    Logger.info("> Initializing Firebase connection...");
    if (
      env.FIREBASE_PROJECT_ID &&
      env.FIREBASE_PROJECT_ID !== "photography-app-dev"
    ) {
      firebaseDatabase.initialize();
      Logger.info("✓ Firebase initialized successfully");
    } else {
      Logger.warn("!! Firebase not configured - running in mock mode");
    }

    app.set("trust proxy", 1);

    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    );

    app.use(
      cors({
        origin: env.CORS_ORIGIN,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        credentials: true,
        maxAge: 86400,
      }),
    );

    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    app.use(compression());

    if (
      process.env.NODE_ENV !== "production" &&
      process.env.SILENT_HTTP_LOGS !== "true"
    ) {
      app.use(morgan("dev"));
    }

    app.use(requestLoggerWithExclusions(["/api/v1/health"]));
    app.use("/api", defaultLimiter);
    app.use("/api/v1", routes);

    app.get("/", (req, res) => {
      res.type("text/plain").send("Photography App API v1.0.0");
    });

    app.get("/health", (req, res) => {
      res
        .type("text/plain")
        .send(
          `healthy | ${process.env.NODE_ENV || "development"} | uptime: ${process.uptime().toFixed(0)}s`,
        );
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    const PORT = env.PORT;
    const server = app.listen(PORT, () => {
      Logger.info(`Server started on port ${PORT}`);
      Logger.info(`Environment: ${env.NODE_ENV}`);
      Logger.info(`API URL: http://localhost:${PORT}/api/v1`);
    });

    const gracefulShutdown = (signal) => {
      Logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(() => {
        Logger.info("HTTP server closed");
        process.exit(0);
      });

      setTimeout(() => {
        Logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 30000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    process.on("uncaughtException", (error) => {
      Logger.error("Uncaught Exception", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      Logger.error("Unhandled Rejection", { reason, promise });
    });

    return server;
  } catch (error) {
    Logger.error("Failed to initialize server", error);
    process.exit(1);
  }
}

export { app, initializeServer };
