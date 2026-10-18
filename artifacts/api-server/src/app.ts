import express, { type Express } from "express";
import pinoHttp from "pino-http";
import router from "./routes/index";
import { logger } from "./lib/logger";
import { corsMiddleware } from "./lib/cors";


const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Cross-origin access control for production, preview, and local development
app.use(corsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normalize duplicated /api prefix if accidentally called as /api/api/...
app.use((req, _res, next) => {
  if (req.url.startsWith("/api/api/")) {
    req.url = req.url.replace(/^\/api\/api\//, "/api/");
  }
  next();
});

// Mount router under /api as well as root so /api/healthz and /healthz both resolve
app.use("/api", router);
app.use(router);

// Unmatched paths return a clean 404 JSON response
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;


