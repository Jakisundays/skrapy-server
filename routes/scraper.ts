import { Elysia } from "elysia";
import {
  getAllFollowers,
  getAllFollowing,
  getCommentsOnPost,
  getLikersOfPost,
} from "../controllers/insta.actions";

const scraperRoutes = new Elysia({ prefix: "/api/scraper" })
  .get("/followers/:idOrUsernameOrUrl", ({ params: { idOrUsernameOrUrl } }) =>
    getAllFollowers(idOrUsernameOrUrl)
  )
  .get("/following/:idOrUsernameOrUrl", ({ params: { idOrUsernameOrUrl } }) =>
    getAllFollowing(idOrUsernameOrUrl)
  )
  .get("/likes/:code_or_id_or_url", ({ params: { code_or_id_or_url } }) =>
    getLikersOfPost(code_or_id_or_url)
  )
  .get("/comments/:code_or_id_or_url", ({ params: { code_or_id_or_url } }) =>
    getCommentsOnPost(code_or_id_or_url)
  );

export default scraperRoutes;
