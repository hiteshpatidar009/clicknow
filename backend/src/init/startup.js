import env from "../config/env.loader.js";
import Logger, { logger } from "../utils/logger.util.js";

console.log("\n========================================");
console.log("🚀 Starting Photography App Backend");
console.log("========================================\n");

Logger.info("✓ Environment variables loaded");
Logger.info(`✓ PORT: ${env.PORT}`);
Logger.info(`✓ ENVIRONMENT: ${env.NODE_ENV}\n.\n`);
Logger.info("> Starting server...\n");

process.env.SILENT_HTTP_LOGS = "true";

const { initializeServer } = await import("./server.js");
const server = await initializeServer();

Logger.info("✓ Server started. Running API tests...\n");
logger.silent = true;
const { runTests } = await import("./api.test.js");
await runTests();
logger.silent = false;
// restore HTTP logging
process.env.SILENT_HTTP_LOGS = "false";

Logger.info("✓ Pre-flight tests completed");
