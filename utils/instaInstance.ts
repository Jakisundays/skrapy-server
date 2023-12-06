import axios, { AxiosInstance } from "axios";

export const instaInstance: AxiosInstance = axios.create({
  baseURL: "https://instagram-scraper-api2.p.rapidapi.com/v1",
  headers: {
    "X-RapidAPI-Key": Bun.env.RAPIDAPI_KEY,
    "X-RapidAPI-Host": Bun.env.RAPIDAPI_HOST,
  },
});

