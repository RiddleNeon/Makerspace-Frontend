import { createAuthClient } from "better-auth/client";

export const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8787"
    : "https://makerspace-backend.arcegamer2022.workers.dev";

export const authClient = createAuthClient({
  baseURL: BACKEND_URL,
});
