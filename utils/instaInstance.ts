import axios, { AxiosInstance } from "axios";
import axiosRateLimit from "axios-rate-limit";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://instagram-scraper-api2.p.rapidapi.com/v1",
  headers: {
    "X-RapidAPI-Key": Bun.env.RAPIDAPI_KEY,
    "X-RapidAPI-Host": Bun.env.RAPIDAPI_HOST,
  },
});

export const instaInstance = axiosRateLimit(axiosInstance, {
  maxRequests: 110,
  perMilliseconds: 60 * 1000,
});
