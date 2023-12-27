import { Elysia, t } from "elysia";
import {
  retrieveUserConnections,
  getLimitedAmount,
  getCommentsOnPost,
  getLikersOfPost,
  retrieveUsersByHashtag,
  getLimitedLikes,
  filterByProperties,
  retrieveUsersByComments,
} from "../controllers/insta.actions";
import axios from "axios";

const scraperRoutes = new Elysia({ prefix: "/api/scraper" })
  .post("/retrieveUsersByHashtag", ({ body }) => retrieveUsersByHashtag(body), {
    body: t.Object({
      hashtag: t.String(),
      amount: t.Number(),
      scraping_id: t.String(),
    }),
  })
  .post(
    "/retrieveUserConnections",
    ({ body }) => retrieveUserConnections(body),
    {
      body: t.Object({
        idOrUsernameOrUrl: t.String(),
        mode: t.Enum({ following: "following", followers: "followers" }),
      }),
    }
  )
  .post("/likes", ({ body }) => getLikersOfPost(body.code_or_id_or_url), {
    body: t.Object({
      code_or_id_or_url: t.String(),
    }),
  })
  .post("/comments", ({ body }) => getCommentsOnPost(body.code_or_id_or_url), {
    body: t.Object({
      code_or_id_or_url: t.String(),
    }),
  })
  .post("/filterByProperties", ({ body }) => filterByProperties(body), {
    body: t.Object({
      idOrUsernameOrUrl: t.String(),
      amount: t.Number(),
      mode: t.Enum({ following: "following", followers: "followers" }),
      filterProperty: t.Enum({
        public_email: "public_email",
        public_phone_number: "public_phone_number",
      }),
      scraping_id: t.String(),
    }),
  })
  .post("/getLimitedAmount", ({ body }) => getLimitedAmount(body), {
    body: t.Object({
      idOrUsernameOrUrl: t.String(),
      amount: t.Number(),
      mode: t.Enum({ following: "following", followers: "followers" }),
      scraping_id: t.String(),
    }),
  })
  .post("/getLimitedLikes", ({ body }) => getLimitedLikes(body), {
    body: t.Object({
      code_or_id_or_url: t.String(),
      amount: t.Number(),
      scraping_id: t.String(),
    }),
  })
  .post(
    "/retrieveUsersByComments",
    ({ body }) => retrieveUsersByComments(body),
    {
      body: t.Object({
        code_or_id_or_url: t.String(),
        amount: t.Number(),
        scraping_id: t.String(),
      }),
    }
  )
  .post("/retreiveUsersByLoc", async () => await retreiveUsersByLoc());

export default scraperRoutes;

const retreiveUsersByLoc = async () => {
  // try {
  //   console.log("trying to get data");
  //   const data = await axios.request({
  //     method: "GET",
  //     url: "https://instagram191.p.rapidapi.com/v2/location/posts/",
  //     params: {
  //       location_id,
  //     },
  //     headers: {
  //       "X-RapidAPI-Key": "052de0cae7msh9adc96399907ab8p1d1612jsn8ba69555e632",
  //       "X-RapidAPI-Host": "instagram191.p.rapidapi.com",
  //     },
  //   });
  //   console.log({ data });
  //   return data;
  // } catch (error) {
  //   console.error({ error });
  //   return error;
  // }
  console.log("trying to get data");
  const options = {
    method: "GET",
    url: "https://instagram191.p.rapidapi.com/v2/location/posts/",
    params: {
      location_id: "378081362682024",
    },
    headers: {
      "X-RapidAPI-Key": "052de0cae7msh9adc96399907ab8p1d1612jsn8ba69555e632",
      "X-RapidAPI-Host": "instagram191.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};
