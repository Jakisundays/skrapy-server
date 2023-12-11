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
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return "¡Ay caramba! 😬 Parece que nos despistamos. No encontramos lo que buscas. Puede ser que la página esté tomando un café. ☕ Intenta de nuevo o verifica tu URL.";
    }
    return "¡Ay, Dios mío! 😱 Algo inesperado ocurrió en nuestro servidor. Nuestro equipo de robots ya está trabajando en ello. Por favor, inténtalo de nuevo más tarde.";
  })
  .listen(8080);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
