import { Elysia } from "elysia";
import { getAllFollowers } from "../utils/insta.actions";

const scraperRoutes = new Elysia({ prefix: "/scraper" }).get(
  "/followers/:idOrUsernameOrUrl",
  ({ params: { idOrUsernameOrUrl } }) => getAllFollowers(idOrUsernameOrUrl)
);

export default scraperRoutes;
