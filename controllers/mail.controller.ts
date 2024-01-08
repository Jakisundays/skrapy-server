import nodemailer from "nodemailer";
import { google } from "googleapis";
import { render } from "@react-email/render";
import { TestingEmail } from "../templates/TestingEmail";
import React from "react";
import { EmailDispatchInfo } from "../types";
const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
  Bun.env.GOOGLE_CLIENT_ID,
  Bun.env.GOOGLE_CLIENT_SECRET,
  `${Bun.env.BASE_ROUTE}/emails/senders` // Este URL debe ser actualizado al punto de redirección deseado
);

export const retrieveAccessToken = async (code: string) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error({ error });
    return error;
  }
};

export const getGoogleUserDetails = async (refreshToken: string) => {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    const people = google.people({ version: "v1", auth: oauth2Client });
    const { data }: any = await people.people.get({
      resourceName: "people/me",
      personFields: "emailAddresses,names,photos",
    });

    const full_name = data.names[0].displayName;
    const email = data.emailAddresses[0].value;
    const avatar_url = data.photos[0].url;

    return { full_name, email, avatar_url };
  } catch (error) {
    console.error("Error retrieving user info:", error);
    throw error;
  }
};

export const getGoogleAuthURL = async () => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://mail.google.com/",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
  });
  return url;
};

export const createTransport = async (refreshToken: string, user: string) => {
  let accessToken = null;

  await oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    oauth2Client.refreshAccessToken((error, res) => {
      if (error) throw new Error("Error refreshing token");
      accessToken = res?.access_token;
    });
    console.log("se hizo el access token");
  } catch (error) {
    throw new Error("Failed to refresh access token :(");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user,
      clientId: Bun.env.GOOGLE_CLIENT_ID,
      clientSecret: Bun.env.GOOGLE_CLIENT_SECRET,
      refreshToken,
      accessToken: accessToken || "",
    },
  });
  return transporter;
};

export const dispatchEmailWithCredentials = async ({
  refresh_token,
  from,
  to,
  emailContent,
}: EmailDispatchInfo) => {
  try {
    const transporter = await createTransport(refresh_token, from);

    const template = render(
      React.createElement(TestingEmail, { emailContent })
    );

    const options = {
      from,
      to,
      subject: emailContent.subject,
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
      message: (error as any).message,
    };
  }
};
