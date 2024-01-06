import { Elysia, t } from "elysia";
import {
  getLimitedAmount,
  retrieveUsersByHashtag,
  getLimitedLikes,
  getUserProfilesByProperties,
  retrieveUsersByComments,
} from "../controllers/insta.actions";

const scraperRoutes = new Elysia({ prefix: "/api/scraper" })
  // Buscar cierta cantidad de usuarios que cumplan ciertas propiedades 🕵️‍♂️🔍
  .post(
    "/getUserProfilesByProperties",
    ({ body }) => getUserProfilesByProperties(body),
    {
      body: t.Object({
        idOrUsernameOrUrl: t.String(),
        amount: t.Number(),
        mode: t.Enum({ following: "following", followers: "followers" }),
        filterProperty: t.Nullable(
          t.Enum({
            public_email: "public_email",
            public_phone_number: "public_phone_number",
          })
        ),
        credits: t.Number(),
        scraping_id: t.Number(),
      }),
    }
  )
  // Buscar usuarios usando un hashtag 🕵️‍♂️🔍
  .post("/retrieveUsersByHashtag", ({ body }) => retrieveUsersByHashtag(body), {
    body: t.Object({
      hashtag: t.String(),
      amount: t.Number(),
      scraping_id: t.Number(),
      filterProperty: t.Nullable(
        t.Enum({
          public_email: "public_email",
          public_phone_number: "public_phone_number",
        })
      ),
      credits: t.Number(),
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
