import { Elysia } from "elysia";
import scraperRoutes from "./routes/scraper";
import { cors } from "@elysiajs/cors";
import emailRoutes from "./routes/email.route";

const app = new Elysia()
  .use(
    cors({
      origin: "RENDER" in Bun.env ? /\*.skrapy.io$/ : true,
    })
  )
  .get("/", () => "¡Bienvenido al server de Skrapy.io! 🎉🤖✨")
  .use(scraperRoutes)
  .use(emailRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
