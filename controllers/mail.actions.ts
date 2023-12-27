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
  }
};

export const getGoogleAuthURL = async () => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://mail.google.com/",
  });
  return url;
};

export const createTransport = async (
  refreshToken: string,
  accessToken: string,
  expires: number,
  user: string
) => {
  let newAccessToken = null;
  const expirationThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Check if the provided access token is expired or will expire soon
  const isAccessTokenExpired = expires < Date.now() + expirationThreshold;

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  if (isAccessTokenExpired) {
    try {
      oauth2Client.refreshAccessToken((error, res) => {
        if (error) throw new Error("Error refreshing token");
        newAccessToken = res?.access_token;
      });
      console.log("se hizo el access token");
    } catch (error) {
      throw new Error("Failed to refresh access token :(");
    }
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
      accessToken: newAccessToken ?? accessToken,
    },
  });
  return transporter;
};

export const dispatchEmailWithCredentials = async ({
  refresh_token,
  access_token,
  expires,
  from,
  to,
  subject,
  content,
  heading,
  preview,
}: EmailDispatchInfo) => {
  console.log({
    refresh_token,
    access_token,
    expires,
    from,
    to,
    subject,
    content,
    heading,
    preview,
  });

  try {
    const transporter = await createTransport(
      refresh_token,
      access_token,
      expires,
      from
    );

    const template = render(
      React.createElement(TestingEmail, { content, heading, preview })
    );

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
      message: (error as any).message,
    };
  }
};
