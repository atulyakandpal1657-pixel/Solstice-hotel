# Vercel Deployment Guide — Solstice Hotel Monorepo

## Architecture Summary

This repository uses **separate Vercel projects** per service. A single-project multi-service deployment from one root `vercel.json` is **not supported by Vercel** — the `services` key used previously is not a valid Vercel schema property.

### Services

| Service | Vercel Project | Root Directory | Publicly Exposed |
|---|---|---|---|
| `solstice-hotel` | `solstice-hotel` | `artifacts/solstice-hotel` | Yes — main SPA website |
| `api-server` | `solstice-hotel-api` | `artifacts/api-server` | Yes — Express 5 Serverless API |
| `mockup-sandbox` | *(local only)* | — | No — internal design preview |

---

## Files Changed

| File | Change |
|---|---|
| `artifacts/solstice-hotel/src/main.tsx` | Initialized `setBaseUrl()` with `VITE_API_BASE_URL`, validation, fallback to relative `/api/...`, and double `/api` prefix prevention |
| `artifacts/solstice-hotel/vercel.json` | Project configuration using monorepo filtered install (`pnpm install --filter @workspace/solstice-hotel... --frozen-lockfile`) and SPA rewrite |
| `artifacts/solstice-hotel/.env.example` | Documented `VITE_API_BASE_URL` |
| `artifacts/api-server/src/lib/cors.ts` | **Created** — CORS handler supporting production origins, Vercel preview domains, standard methods/headers, and 24h preflight caching |
| `artifacts/api-server/src/app.ts` | Configured CORS middleware, `/api/api/` normalization, and dual-mount routes (`/api` + root) |
| `artifacts/api-server/api/index.ts` | Serverless adapter exporting Express `app` without `listen()` |
| `artifacts/api-server/vercel.json` | Validated current Vercel schema: monorepo filtered install, `includeFiles: "dist/**"`, catch-all rewrite, no obsolete runtime version |
| `artifacts/api-server/.env.example` | Documented CORS origins, database credentials, and runtime settings |
| `vercel.json` (root) | Minimal placeholder with `"ignoreCommand": "exit 0"` to prevent accidental root deployments |

---

## Dashboard Settings for Both Projects

### Project 1: `solstice-hotel` (Frontend SPA)

1. In Vercel Dashboard, click **Add New...** > **Project** and select this repository.
2. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `artifacts/solstice-hotel`
   - **Include files outside root directory**: Checked (`true`, default in monorepos)
   - **Install Command**: `pnpm install --filter @workspace/solstice-hotel... --frozen-lockfile` (defined in `vercel.json`)
   - **Build Command**: `pnpm run build` (defined in `vercel.json`)
   - **Output Directory**: `dist/public` (defined in `vercel.json`)
3. **Environment Variables**:
   - `VITE_API_BASE_URL`: The URL of your deployed `solstice-hotel-api` project (e.g., `https://solstice-hotel-api.vercel.app`). Do not append `/api`.

### Project 2: `solstice-hotel-api` (Backend Express API)

1. In Vercel Dashboard, click **Add New...** > **Project** and select this repository again.
2. In Project Settings:
   - **Framework Preset**: `Other`
   - **Root Directory**: `artifacts/api-server`
   - **Include files outside root directory**: Checked (`true`, default in monorepos)
   - **Install Command**: `pnpm install --filter @workspace/api-server... --frozen-lockfile` (defined in `vercel.json`)
   - **Build Command**: `pnpm run build` (defined in `vercel.json`)
   - **Output Directory**: `.` (defined in `vercel.json`)
3. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend domains (e.g., `https://solstice-hotel.vercel.app`)
   - `FRONTEND_URL`: Primary frontend origin (e.g., `https://solstice-hotel.vercel.app`)
   - `DATABASE_URL`: PostgreSQL connection string (Server-side secret, keep server-side only)

---

## Environment Variables Reference

### Frontend (`solstice-hotel`)

| Variable | Public? | Required in Production? | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes (bundled) | Yes | Base URL of the API server (e.g. `https://solstice-hotel-api.vercel.app`). If omitted, requests remain relative `/api/...`. |

### Backend (`api-server`)

| Variable | Public? | Required in Production? | Purpose |
|---|---|---|---|
| `NODE_ENV` | No | Yes | Set to `production` (enables optimized logging and strict origin checking). |
| `ALLOWED_ORIGINS` | No | Yes | Comma-separated allowed origins (e.g. `https://solstice-hotel.vercel.app,http://localhost:5173`). |
| `FRONTEND_URL` | No | Optional | Single frontend origin alternative to `ALLOWED_ORIGINS`. |
| `DATABASE_URL` | No | Yes (for DB) | PostgreSQL connection string. Throws explicit error if missing. |
| `LOG_LEVEL` | No | Optional | Pino log level (default: `info`). |

---

## Preview Deployment and Smoke-Test Instructions

### 1. Backend Smoke-Test
After deploying `solstice-hotel-api`:
- **Health Check**:
  ```bash
  curl -i https://<your-api-project>.vercel.app/api/healthz
  # Expected: HTTP/1.1 200 OK
  # Body: {"status":"ok"}
  ```
- **Preflight & CORS Check**:
  ```bash
  curl -i -X OPTIONS https://<your-api-project>.vercel.app/api/healthz \
    -H "Origin: https://solstice-hotel.vercel.app" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type"
  # Expected: HTTP/1.1 204 No Content
  # Header: Access-Control-Allow-Origin: https://solstice-hotel.vercel.app
  ```
- **Disallowed Origin Check**:
  ```bash
  curl -i https://<your-api-project>.vercel.app/api/healthz \
    -H "Origin: https://unauthorized-domain.com"
  # Expected: HTTP/1.1 200 OK without Access-Control-Allow-Origin header
  ```

### 2. Frontend Smoke-Test
After deploying `solstice-hotel`:
- Open `https://<your-frontend-project>.vercel.app` in a browser.
- Open Developer Tools > Network tab.
- Verify API requests target `https://<your-api-project>.vercel.app/api/...` and receive `200 OK`.
- Refresh non-root routes (e.g., `/not-found`) to confirm SPA client-side routing fallback works properly.

---

## Remaining Limitations & Manual Actions

1. **Vercel Dashboard Project Setup**: You must link the repository twice in Vercel to create two separate projects (`solstice-hotel` and `solstice-hotel-api`) with their respective Root Directories.
2. **Database Provisioning**: Set `DATABASE_URL` in the `solstice-hotel-api` project environment variables before performing database queries.
3. **Mockup Sandbox**: `artifacts/mockup-sandbox` remains local-only. Do not create a Vercel project for it.
