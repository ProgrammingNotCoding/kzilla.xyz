import { Hono } from "hono";
import linkRouter from "./link-router";

const appRouter = new Hono();

appRouter.get("/", (c) => {
  return c.text("Hello World!");
});

appRouter.route("/links", linkRouter);

export default appRouter;
