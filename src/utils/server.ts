import type { Context, Hono } from "hono";
import appRouter from "../routes";
import InitDatabase from "./db";
import { appendTrailingSlash, trimTrailingSlash } from "hono/trailing-slash";
import { errorHandler } from "./errors";

export async function BootstrapServer(app: Hono) {
  await InitDatabase();
  console.log("✅ Database Connected!");

  app.route("/api/v1", appRouter);

  app.onError((err: Error, c: Context) => {
    return errorHandler(err, c);
  });
}
