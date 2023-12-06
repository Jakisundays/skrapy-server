import { Elysia } from "elysia";
import scraperRoutes from "./routes/scraper";

const app = new Elysia({ prefix: "/api" })
  .get("/", () => "Hello Elysia")
  .use(scraperRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
