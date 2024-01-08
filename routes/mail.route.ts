import Elysia, { t } from "elysia";
import {
  dispatchEmailWithCredentials,
  getGoogleAuthURL,
  getGoogleUserDetails,
  retrieveAccessToken,
} from "../controllers/mail.controller";

const mailRoutes = new Elysia({ prefix: "/api/mail" })
  .get("/", () => getGoogleAuthURL())
  .post("/retrieveAccessToken", ({ body }) => retrieveAccessToken(body.code), {
    body: t.Object({
      code: t.String(),
    }),
  })
  .post(
    "/getGoogleUserDetails",
    ({ body }) => getGoogleUserDetails(body.refreshToken),
    {
      body: t.Object({
        refreshToken: t.String(),
      }),
    }
  )
  .post(
    "/dispatchEmailWithCredentials",
    ({ body }) => dispatchEmailWithCredentials(body),
    {
      body: t.Object({
        refresh_token: t.String(),
        from: t.String(),
        to: t.Array(t.String()),
        emailContent: t.Object({
          subject: t.String(),
          heading: t.String(),
          buttonName: t.String(),
          buttonLink: t.String(),
          content: t.String(),
        }),
      }),
    }
  );

export default mailRoutes;
