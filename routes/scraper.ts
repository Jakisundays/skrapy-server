import { Elysia, t } from "elysia";
import {
  getAllUsersByType,
  getAmountOfUsers,
  getCommentsOnPost,
  getLikersOfPost,
  getUsersByHashtag,
  scanUsersForFilteredProperty,
} from "../controllers/insta.actions";

const scraperRoutes = new Elysia({ prefix: "/api/scraper" })
  .get("hashtag/:hashtag", ({ params: { hashtag } }) =>
    getUsersByHashtag(hashtag)
  )
  .post("/retrieveUserConnections", ({ body }) => getAllUsersByType(body), {
    body: t.Object({
      idOrUsernameOrUrl: t.String(),
      mode: t.Enum({ following: "following", followers: "followers" }),
    }),
  })
  .post("/likes", ({ body }) => getLikersOfPost(body.code_or_id_or_url), {
    body: t.Object({
      code_or_id_or_url: t.String(),
    }),
  })
  .post("/comments", ({ body }) => getCommentsOnPost(body.code_or_id_or_url), {
    body: t.Object({
      code_or_id_or_url: t.String(),
    }),
  })
  .post(
    "/filterByProperties",
    ({ body }) => scanUsersForFilteredProperty(body),
    {
      body: t.Object({
        idOrUsernameOrUrl: t.String(),
        amount: t.Number(),
        mode: t.Enum({ following: "following", followers: "followers" }),
        filterProperty: t.Enum({
          public_email: "public_email",
          public_phone_number: "public_phone_number",
        }),
      }),
    }
  )
  .post("/getLimitedAmount", ({ body }) => getAmountOfUsers(body), {
    body: t.Object({
      idOrUsernameOrUrl: t.String(),
      amount: t.Number(),
      mode: t.Enum({ following: "following", followers: "followers" }),
    }),
  });

export default scraperRoutes;
