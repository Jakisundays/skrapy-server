import { Resend } from "resend";
import { Elysia, t } from "elysia";
import { WaitlistEmail } from "../templates/waitlist-email";

const resend = new Resend(Bun.env.RESEND_API_KEY);

const emailRoutes = new Elysia({ prefix: "/api/email" }).post(
  "/send",
  async ({ body }) => {
    const { to, subject, full_name } = body;
    try {
      const { data, error } = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to,
        subject,
        react: WaitlistEmail({ name: full_name }),
      });
      if (error) {
        throw new Error(error.message);
      }
      return new Response(JSON.stringify(data));
    } catch (error) {
      console.log({ error });
      return new Response(JSON.stringify(error));
    }
  },
  {
    body: t.Object({
      full_name: t.String(),
      subject: t.String(),
      to: t.String(),
    }),
  }
);

export default emailRoutes;
