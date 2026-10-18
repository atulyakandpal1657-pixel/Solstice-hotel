/**
 * Vercel serverless function entrypoint for the api-server.
 *
 * This file is the Vercel Functions entry point. Vercel invokes it
 * per-request, so we export the Express app as the default export.
 * The Vercel Node.js runtime wraps it as a standard (req, res) handler.
 *
 * IMPORTANT: This file is compiled and deployed as-is; it does NOT call
 * app.listen() because Vercel manages the HTTP lifecycle. The persistent
 * server in src/index.ts is only used in local/Replit development.
 *
 * Route structure:
 *   - Express mounts routes at /api/* (see src/app.ts: app.use("/api", router))
 *   - The Vercel rewrite in vercel.json forwards /api/(.*) to this function
 *   - The full request path (including /api prefix) is preserved, so Express
 *     sees /api/healthz and the router matches /healthz under the /api prefix.
 *
 * No PORT environment variable is required for Vercel deployments.
 */
import app from "../src/app";

export default app;

