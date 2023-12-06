import { Elysia } from "elysia";
import scraperRoutes from "./routes/scraper";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(
    cors({
      origin: "RENDER" in Bun.env ? /\*.skrapy.io$/ : true,
    })
  )
  .get("/", () => "¡Bienvenido al server de Skrapy.io! 🎉🤖✨")
  .use(scraperRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
