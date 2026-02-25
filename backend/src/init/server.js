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
let isConfigured = false;
let infrastructureInitialized = false;
let bootstrapPromise = null;
let shutdownHandlersRegistered = false;

import connectDB from "../config/db.js";

const resolveCorsOrigins = () => {
  const configured = String(env.CORS_ORIGIN || "").trim();
  if (!configured || configured === "*") {
    return true;
  }

  const origins = configured
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (origin, callback) => {
    // Allow server-to-server and curl requests without an Origin header.
    if (!origin) return callback(null, true);
    if (origins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  };
};

function configureApp() {
  if (isConfigured) {
    return app;
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
      origin: resolveCorsOrigins(),
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
    const acceptsHtml = req.accepts(["html", "json"]) === "html";
    if (!acceptsHtml) {
      return res.json({
        success: true,
        name: "ClickNow Photography API",
        version: "1.0.0",
        docsHint: "Use /api/v1/health and /api/v1/* endpoints",
      });
    }

    return res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ClickNow API</title>
    <style>
      :root { --bg:#f2f5fb; --card:#ffffff; --ink:#111827; --muted:#6b7280; --line:#e5e7eb; --btn:#111827; --btnTxt:#fff; }
      *{box-sizing:border-box} body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;background:linear-gradient(180deg,#eef3ff,#f7fafc);color:var(--ink)}
      .wrap{max-width:920px;margin:30px auto;padding:0 16px}
      .hero{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px}
      h1{margin:0 0 8px;font-size:28px} p{margin:0;color:var(--muted)}
      .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin-top:16px}
      .item{border:1px solid var(--line);border-radius:12px;padding:12px;background:#fff}
      .item code{display:block;margin-top:6px;color:#0f172a}
      .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
      .btn{display:inline-block;padding:10px 12px;border-radius:10px;text-decoration:none;background:var(--btn);color:var(--btnTxt);font-weight:600}
      .btn.alt{background:#fff;color:#111827;border:1px solid var(--line)}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="hero">
        <h1>ClickNow Photography API</h1>
        <p>Backend is running. Use the links below to test key endpoints.</p>
        <div class="actions">
          <a class="btn" href="/health">Health</a>
          <a class="btn alt" href="/api/v1/health">API Health</a>
        </div>
        <div class="grid">
          <div class="item"><strong>Auth</strong><code>POST /api/v1/auth/register</code><code>POST /api/v1/auth/login</code></div>
          <div class="item"><strong>OTP</strong><code>POST /api/v1/auth/send-otp</code><code>POST /api/v1/auth/verify-otp</code></div>
          <div class="item"><strong>Uploads</strong><code>POST /api/v1/uploads/documents</code><code>POST /api/v1/uploads/portfolio</code></div>
          <div class="item"><strong>Professional</strong><code>POST /api/v1/professionals</code><code>PUT /api/v1/professionals/me</code></div>
        </div>
      </div>
    </div>
  </body>
</html>`);
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

  isConfigured = true;
  return app;
}

async function initializeInfrastructure() {
  if (infrastructureInitialized) {
    return;
  }

  try {
    Logger.info("> Initializing MongoDB connection...");
    const isMongoConnected = await connectDB();
    if (isMongoConnected) {
      Logger.info("✓ MongoDB initialized successfully");
    } else {
      Logger.warn("!! MongoDB unavailable - continuing in degraded mode");
    }

    Logger.info("> Initializing Firebase connection...");
    if (
      env.FIREBASE_PROJECT_ID &&
      env.FIREBASE_PROJECT_ID !== "photography-app-dev"
    ) {
      firebaseDatabase.initialize();
    } else {
      Logger.warn("!! Firebase not configured - running in mock mode");
    }
    infrastructureInitialized = true;
  } catch (error) {
    Logger.error("Failed to initialize infrastructure", error);
    throw error;
  }
}

async function bootstrapApp() {
  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    await initializeInfrastructure();
    return configureApp();
  })().catch((error) => {
    bootstrapPromise = null;
    throw error;
  });

  return bootstrapPromise;
}

function registerShutdownHandlers(server) {
  if (shutdownHandlersRegistered) {
    return;
  }
  shutdownHandlersRegistered = true;

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
}

/**
 * Initialize local server (listen on port)
 */
async function initializeServer() {
  try {
    const configuredApp = await bootstrapApp();
    const PORT = env.PORT;
    const server = configuredApp.listen(PORT, () => {
      Logger.info(`Server started on port ${PORT}`);
      Logger.info(`Environment: ${env.NODE_ENV}`);
      Logger.info(`API URL: http://localhost:${PORT}/api/v1`);
    });
    registerShutdownHandlers(server);

    return server;
  } catch (error) {
    Logger.error("Failed to initialize server", error);
    process.exit(1);
  }
}

/**
 * Get initialized app for serverless runtimes (Vercel)
 */
async function getVercelApp() {
  return bootstrapApp();
}

export { app, initializeServer, getVercelApp };
