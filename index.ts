import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import scraperRoutes from "./routes/scraper.route";
import mailRoutes from "./routes/mail.route";

const app = new Elysia()
  .use(
    cors({
      // origin: "RENDER" in Bun.env ? /\*.skrapy.io$/ : true,
    })
  )
  .get("/", () => "¡Bienvenido al server de Skrapy.io! 🎉🤖✨")
  .use(scraperRoutes)
  .use(mailRoutes)
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return "¡Ay caramba! 😬 Parece que nos despistamos. No encontramos lo que buscas. Puede ser que la página esté tomando un café. ☕ Intenta de nuevo o verifica tu URL.";
    }
    return "¡Ay, Dios mío! 😱 Algo inesperado ocurrió en nuestro servidor. Nuestro equipo de robots ya está trabajando en ello. Por favor, inténtalo de nuevo más tarde.";
  })
  .listen(8080);

console.log(
  `🚀 Skrapy.io is running at http://${app.server?.hostname}:${app.server?.port}`
);
