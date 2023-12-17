import Elysia, { t } from "elysia";
import {
  createTransport,
  getGoogleAuthURL,
  retrieveAccessToken,
} from "../controllers/mail.actions";
import { render } from "@react-email/render";
import { Email } from "../templates/email";
import { TestingEmail } from "../templates/TestingEmail";
import React from "react";

const authRoutes = new Elysia({ prefix: "/api/auth" })
  .get("/", () => getGoogleAuthURL())
  .post("/tokens", ({ body }) => retrieveAccessToken(body.code), {
    body: t.Object({
      code: t.String(),
    }),
  })
  .post(
    "/sendmail",
    async ({ body }) => {
      const {
        refresh_token,
        access_token,
        expires,
        from,
        to,
        subject,
        content,
      } = body;
      try {
        const transporter = await createTransport(
          refresh_token,
          access_token,
          expires
        );

        // const template = render(<TestingEmail content={content} />);
        const template = render(React.createElement(TestingEmail, { content }));
        const options = {
          from,
          to,
          subject,
          html: template,
        };
        await transporter.sendMail(options);
        return {
          status: 200,
          message: "Email sent successfully",
        };
      } catch (error) {
        console.error("Error sending email:", error);

        return {
          status: 500,
          message: "Internal server error",
        };
      }
    },
    {
      body: t.Object({
        refresh_token: t.String(),
        access_token: t.String(),
        expires: t.Number(),
        from: t.String(),
        to: t.String(),
        subject: t.String(),
        content: t.String(),
      }),
    }
  );
// .post(
//   "/tokens",
//   async ({ body }) => {
//     try {
//       const tokens = await retrieveAccessToken(body.code);
//       if (!tokens?.refresh_token) {
//         throw new Error("Failed to retrieve access token");
//       }
//       const transporter = await createTransport(
//         tokens.refresh_token,
//         tokens.access_token as string,
//         tokens.expiry_date as number
//       );
//       await transporter.sendMail({
//         from: "jacobguillermooo@gmail.com",
//         to: "skrapy@skrapy.io",
//         subject: "Probando correos electrónicos 📬✅",
//         html: "<p>¡Este es un correo de prueba creado por Jacob! 📧✨</p>",
//       });
//       console.log("mail sended");
//       return tokens;
//     } catch (error) {
//       console.error(error);
//     }
//   },
//   {
//     body: t.Object({ code: t.String() }),
//   }
// );

export default authRoutes;
