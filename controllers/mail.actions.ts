import nodemailer from "nodemailer";
import { google } from "googleapis";

const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
  Bun.env.GOOGLE_CLIENT_ID,
  Bun.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/mail"
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
  expires: number
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
      user: "jacobguillermooo@gmail.com",
      clientId: Bun.env.GOOGLE_CLIENT_ID,
      clientSecret: Bun.env.GOOGLE_CLIENT_SECRET,
      refreshToken,
      accessToken: newAccessToken ?? accessToken,
    },
  });
  return transporter;
};
