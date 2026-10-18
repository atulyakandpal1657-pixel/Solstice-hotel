import cors, { type CorsOptions } from "cors";

/**
 * Parses allowed origins from environment variables.
 * Supported variables:
 * - ALLOWED_ORIGINS: Comma-separated list of origins (e.g. "https://solstice-hotel.vercel.app,http://localhost:5173")
 * - FRONTEND_URL: Single frontend origin (e.g. "https://solstice-hotel.vercel.app")
 */
function getAllowedOrigins(): string[] {
  const envOrigins = [process.env.ALLOWED_ORIGINS, process.env.FRONTEND_URL]
    .filter(Boolean)
    .join(",");

  return envOrigins
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

// Vercel preview domain pattern for solstice-hotel (e.g., https://solstice-hotel-git-feat-team.vercel.app)
const defaultPreviewRegex = /^https:\/\/solstice-hotel(-[a-zA-Z0-9_-]+)*\.vercel\.app$/;

export function createCorsOptions(): CorsOptions {
  const allowedList = getAllowedOrigins();
  const customRegex = process.env.ALLOWED_ORIGIN_REGEX
    ? new RegExp(process.env.ALLOWED_ORIGIN_REGEX)
    : defaultPreviewRegex;

  return {
    origin: (origin, callback) => {
      // 1. Allow non-browser requests (no origin header, e.g. health checks, server-to-server, curl)
      if (!origin) {
        return callback(null, true);
      }

      const normalized = origin.trim().replace(/\/+$/, "");

      // 2. Allow explicitly listed production/staging origins
      if (allowedList.includes(normalized)) {
        return callback(null, true);
      }

      // 3. Allow local dev origins when NODE_ENV is not production
      if (process.env.NODE_ENV !== "production") {
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
          return callback(null, true);
        }
      }

      // 4. Allow Vercel preview deployments matching the project pattern
      if (customRegex.test(normalized)) {
        return callback(null, true);
      }

      // Origin not permitted: return false to disallow without throwing unhandled server exception
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
    credentials: false, // Cookie credentials are not required by this API's design
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24-hour preflight cache
  };
}

export const corsMiddleware = cors(createCorsOptions());
