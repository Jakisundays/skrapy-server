import { Elysia, t } from "elysia";
import {
  getAllFollowers,
  getAllFollowing,
  getCommentsOnPost,
  getLikersOfPost,
  getUsersByHashtag,
} from "../controllers/insta.actions";

const scraperRoutes = new Elysia({ prefix: "/api/scraper" })
  .get("hashtag/:hashtag", ({ params: { hashtag } }) =>
    getUsersByHashtag(hashtag)
  )
  .post("/followers", ({ body }) => getAllFollowers(body.idOrUsernameOrUrl), {
    body: t.Object({
      idOrUsernameOrUrl: t.String(),
    }),
  })
  .post("/following", ({ body }) => getAllFollowing(body.idOrUsernameOrUrl), {
    body: t.Object({
      idOrUsernameOrUrl: t.String(),
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
  });

export default scraperRoutes;
