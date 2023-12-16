import Elysia, { t } from "elysia";
import {
  createTransport,
  getGoogleAuthURL,
  retrieveAccessToken,
} from "../controllers/mail.actions";

const authRoutes = new Elysia({ prefix: "/api/auth" })
  .get("/", () => getGoogleAuthURL())
  .post(
    "/tokens",
    async ({ body }) => {
      try {
        const tokens = await retrieveAccessToken(body.code);
        if (!tokens?.refresh_token) {
          throw new Error("Failed to retrieve access token");
        }
        const transporter = await createTransport(
          tokens.refresh_token,
          tokens.access_token as string,
          tokens.expiry_date as number
        );
        await transporter.sendMail({
          from: "jacobguillermooo@gmail.com",
          to: "skrapy@skrapy.io",
          subject: "Probando correos electrónicos 📬✅",
          html: "<p>¡Este es un correo de prueba creado por Jacob! 📧✨</p>",
        });
        console.log("mail sended");
        return tokens;
      } catch (error) {
        console.error(error);
      }
    },
    {
      body: t.Object({ code: t.String() }),
    }
  );

export default authRoutes;
