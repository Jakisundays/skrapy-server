import { Elysia } from "elysia";
import { getAllFollowers } from "../controllers/insta.actions";

const scraperRoutes = new Elysia({ prefix: "/scraper" }).get(
  "/followers/:idOrUsernameOrUrl",
  ({ params: { idOrUsernameOrUrl } }) => getAllFollowers(idOrUsernameOrUrl)
);

export default scraperRoutes;
