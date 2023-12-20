import { Elysia, t } from "elysia";
import {
  getAllUsersByType,
  getAmountOfUsers,
  getCommentsOnPost,
  getLikersOfPost,
  retrieveUsersByHashtag,
  retrieveAmountOfUsersByLikes,
  scanUsersForFilteredProperty,
} from "../controllers/insta.actions";

const scraperRoutes = new Elysia({ prefix: "/api/scraper" })
  .post("/retrieveUsersByHashtag", ({ body }) => retrieveUsersByHashtag(body), {
    body: t.Object({
      hashtag: t.String(),
      amount: t.Number(),
    }),
  })
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
  })
  .post("/getLimitedLikes", ({ body }) => retrieveAmountOfUsersByLikes(body), {
    body: t.Object({
      code_or_id_or_url: t.String(),
      amount: t.Number(),
    }),
  });
// .post(
//   "/getLimitedComments",
//   ({ body }) => retrieveAmountOfUsersByComments(body),
//   {
//     body: t.Object({
//       code_or_id_or_url: t.String(),
//       amount: t.Number(),
//     }),
//   }
// );

export default scraperRoutes;
