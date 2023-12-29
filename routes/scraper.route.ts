import { Elysia, t } from "elysia";
import {
  retrieveUserConnections,
  getLimitedAmount,
  getCommentsOnPost,
  getLikersOfPost,
  retrieveUsersByHashtag,
  getLimitedLikes,
  filterByProperties,
  retrieveUsersByComments,
} from "../controllers/insta.actions";

const scraperRoutes = new Elysia({ prefix: "/api/scraper" })
  // Rutas sin amount
  // Buscar todos los seguidores/seguidos de un usuario 🕵️‍♂️👥
  .post(
    "/retrieveUserConnections",
    ({ body }) => retrieveUserConnections(body),
    {
      body: t.Object({
        idOrUsernameOrUrl: t.String(),
        mode: t.Enum({ following: "following", followers: "followers" }),
      }),
    }
  )
  // Buscar todos los usuarios que dieron "me gusta" a una publicación ❤️
  .post("/likes", ({ body }) => getLikersOfPost(body.code_or_id_or_url), {
    body: t.Object({
      code_or_id_or_url: t.String(),
    }),
  })
  // Buscar todos los usuarios que comentaron en una publicación 💬
  .post("/comments", ({ body }) => getCommentsOnPost(body.code_or_id_or_url), {
    body: t.Object({
      code_or_id_or_url: t.String(),
    }),
  })
  // Rutas con amount
  // Buscar usuarios usando un hashtag 🕵️‍♂️🔍
  .post("/retrieveUsersByHashtag", ({ body }) => retrieveUsersByHashtag(body), {
    body: t.Object({
      hashtag: t.String(),
      amount: t.Number(),
      scraping_id: t.Number(),
    }),
  })
  // Buscar cierta cantidad de usuarios que cumplan ciertas propiedades 🕵️‍♂️🔍
  .post("/filterByProperties", ({ body }) => filterByProperties(body), {
    body: t.Object({
      idOrUsernameOrUrl: t.String(),
      amount: t.Number(),
      mode: t.Enum({ following: "following", followers: "followers" }),
      filterProperty: t.Enum({
        public_email: "public_email",
        public_phone_number: "public_phone_number",
      }),
      scraping_id: t.Number(),
    }),
  })
  // Buscar cierta cantidad de seguidores/seguidos de un usuario 🕵️‍♂️👥🔍
  .post("/getLimitedAmount", ({ body }) => getLimitedAmount(body), {
    body: t.Object({
      idOrUsernameOrUrl: t.String(),
      amount: t.Number(),
      mode: t.Enum({ following: "following", followers: "followers" }),
      scraping_id: t.Number(),
    }),
  })
  // Buscar cierta cantidad de usuarios que dieron "me gusta" en un post 🕵️‍♂️❤️🔍
  .post("/getLimitedLikes", ({ body }) => getLimitedLikes(body), {
    body: t.Object({
      code_or_id_or_url: t.String(),
      amount: t.Number(),
      scraping_id: t.Number(),
    }),
  })
  // Buscar cierta cantidad de usuarios que comentaron en un post 🕵️‍♂️💬🔍
  .post(
    "/retrieveUsersByComments",
    ({ body }) => retrieveUsersByComments(body),
    {
      body: t.Object({
        code_or_id_or_url: t.String(),
        amount: t.Number(),
        scraping_id: t.Number(),
      }),
    }
  );
// .post("/retreiveUsersByLoc", async () => await retreiveUsersByLoc()); GEO LOC PENDING

export default scraperRoutes;
