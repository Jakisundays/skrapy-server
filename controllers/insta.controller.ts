import {
  BaseUser,
  FilteredUserScanParams,
  Leads,
  User,
  UserProfile,
  LimitedInteractionDetails,
} from "../types";
import {
  addLeadsToDatabase,
  countLeadsByContactInfo,
  editScrapingContacts,
  getUserIDByScrapingID,
  getUsersWithContactInfo,
  spendCredits,
  turnUserProfilesIntoLeads,
} from "../utils/database-helpers";
import { instaInstance } from "../utils/instaInstance";

const fetchUsersWithTokenUsage = async ({
  code_or_id_or_url,
  amount,
  filterProperty,
  credits,
}: {
  code_or_id_or_url: string;
  amount: number;
  filterProperty: "public_email" | "public_phone_number" | null;
  credits: number;
}) => {
  const usersWithFilteredProperty: UserProfile[] = [];
  let usedCredits = 0;
  let paginationToken: string | undefined = undefined;

  try {
    while (
      usersWithFilteredProperty.length < amount &&
      paginationToken !== null &&
      usedCredits < credits
    ) {
      const { data }: any = await instaInstance.get("/likes", {
        params: {
          code_or_id_or_url,
          pagination_token: paginationToken,
        },
      });

      const nextPageToken = data.pagination_token;
      const { items } = data.data;
      const filteredPublicUsers: User[] = items
        .filter((user: any) => !user.is_private)
        .map((user: any) => ({
          id: user.id,
          userName: user.username,
          full_name: user.full_name,
          profile_pic_url: user.profile_pic_url,
          is_private: user.is_private,
        }));

      for (const { id, ...rest } of filteredPublicUsers) {
        if (
          usedCredits >= credits ||
          usersWithFilteredProperty.length >= amount
        ) {
          break; // Exit the loop if credits are exhausted or desired amount is reached
        }

        usedCredits++;
        const userInfo = await retrieveUserInfo(id);

        if (userInfo) {
          if (filterProperty && userInfo[filterProperty]) {
            const userProfile: UserProfile = {
              ...rest,
              ...userInfo,
            };
            usersWithFilteredProperty.push(userProfile);
          } else if (!filterProperty) {
            usersWithFilteredProperty.push(userInfo);
          }
        }
      }

      console.log({
        usedCreditsOnToeknsandUserFUnc: usedCredits,
        lengthOnFUnc: usersWithFilteredProperty.length,
      });

      // Update pagination token for the next iteration
      paginationToken = nextPageToken;
    }

    return { usersWithFilteredProperty, usedCredits };
  } catch (error) {
    console.error({ error });
    // Re-throw the error for higher-level error handling
    throw error;
  }
};
// La función retrieveUserInfo no debería ser exportada, pero se exporta debido a su uso en testing.ts 🤔
export const retrieveUserInfo = async (
  idOrUsernameOrUrl: string
): Promise<UserProfile | null> => {
  try {
    const { data } = await instaInstance.get("/info", {
      params: { username_or_id_or_url: idOrUsernameOrUrl },
    });
    const info = data.data;

    const user: UserProfile = {
      id: info.id,
      userName: info.username,
      full_name: info.full_name,
      profile_pic_url: info.profile_pic_url,
      is_verified: info.is_verified,
      is_private: info.is_private,
      follower_count: info.follower_count,
      following_count: info.following_count,
      media_count: info.media_count,
      public_phone_country_code: info.public_phone_country_code,
      public_phone_number: info.public_phone_number,
      public_email: info.public_email,
      location: {
        address_street: info.location_data.address_street,
        city_name: info.location_data.city_name,
        city_id: info.location_data.city_id,
        instagram_location_id: info.location_data.instagram_location_id,
        latitude: info.location_data.latitude,
        longitude: info.location_data.longitude,
        zip: info.location_data.zip,
      },
      external_url: data.external_url,
    };
    // await new Promise(resolve => setTimeout(resolve, 10000));
    return user;
  } catch (error) {
    return null;
  }
};

export const getUsersFromHashtag = async ({
  hashtag,
  amount,
  scraping_id,
  filterProperty,
  credits,
}: {
  hashtag: string;
  amount: number;
  scraping_id: number;
  filterProperty: "public_email" | "public_phone_number" | null;
  credits: number;
}) => {
  try {
    let usersWithFilteredProperty: UserProfile[] = [];
    let usedCredits = 0;
    let amountNeeded = amount;
    let creditBalance = credits;
    let paginationToken: string | undefined = undefined;

    do {
      const { data }: any = await instaInstance.get("/hashtag", {
        params: { hashtag },
      });

      const nextPageToken = data.pagination_token;
      const { items } = data.data;

      for (const { id } of items) {
        if (
          usersWithFilteredProperty.length >= amount ||
          usedCredits >= credits ||
          amountNeeded === 0
        ) {
          break; // Exit the loop if conditions are met
        }

        const {
          usersWithFilteredProperty: filteredUsersList,
          usedCredits: creditSpent,
        } = await fetchUsersWithTokenUsage({
          code_or_id_or_url: id,
          amount: amountNeeded,
          filterProperty,
          credits: creditBalance,
        });

        amountNeeded -= filteredUsersList.length;
        creditBalance -= creditSpent;
        usedCredits += creditSpent;

        console.log({
          creditSpent,
          filteredUsersList,
          amountNeeded,
          creditBalance,
          usedCredits,
        });

        if (filteredUsersList) {
          usersWithFilteredProperty =
            usersWithFilteredProperty.concat(filteredUsersList);
        }
      }

      paginationToken = nextPageToken;
    } while (
      paginationToken &&
      usersWithFilteredProperty.length < amount &&
      usedCredits < credits
    );

    const usersWithContactInfo = getUsersWithContactInfo(
      usersWithFilteredProperty
    );
    const leads: Leads[] = turnUserProfilesIntoLeads(
      usersWithContactInfo,
      scraping_id
    );

    await addLeadsToDatabase(leads);

    const { emailCount, phoneCount } = countLeadsByContactInfo(leads);

    await editScrapingContacts(emailCount, phoneCount, scraping_id);

    const userId = await getUserIDByScrapingID(scraping_id);

    await spendCredits(userId, usedCredits);

    return usersWithFilteredProperty;
  } catch (error) {
    console.error({ error });
    return new Response("Bad request", { status: 500 });
  }
};

export const getUserProfilesByProperties = async ({
  idOrUsernameOrUrl,
  amount,
  mode,
  scraping_id,
  filterProperty,
  credits,
}: FilteredUserScanParams) => {
  try {
    let usersWithFilteredProperty: UserProfile[] = [];
    let paginationToken: string | undefined = undefined;
    let usedCredits = 0;

    do {
      // Fetch data from Instagram API
      const { data }: any = await instaInstance.get(`/${mode}`, {
        params: {
          username_or_id_or_url: idOrUsernameOrUrl,
          pagination_token: paginationToken,
        },
      });

      // Extract relevant information from the response
      const nextPageToken = data.pagination_token;
      const { items } = data.data;

      // Filter and map public users from Instagram data
      const filteredPublicUsers: BaseUser[] = items
        .filter((user: any) => !user.is_private)
        .map((user: any) => ({
          id: user.id,
          userName: user.username,
          full_name: user.full_name,
          profile_pic_url: user.profile_pic_url,
          is_verified: user.is_verified,
          is_private: user.is_private,
        }));

      // Process each user to check filter criteria
      for (const { id, ...rest } of filteredPublicUsers) {
        if (
          usedCredits >= credits ||
          usersWithFilteredProperty.length >= amount
        ) {
          break; // Exit the loop if credits are exhausted or desired amount is reached
        }

        usedCredits++;
        const userInfo = await retrieveUserInfo(id);

        if (userInfo) {
          if (filterProperty && userInfo[filterProperty]) {
            const userProfile: UserProfile = {
              ...rest,
              ...userInfo,
            };
            usersWithFilteredProperty.push(userProfile);
          } else if (!filterProperty) {
            usersWithFilteredProperty.push(userInfo);
          }
        }
      }

      // Update pagination token for the next API call
      paginationToken = nextPageToken;
    } while (
      paginationToken &&
      usersWithFilteredProperty.length < amount &&
      usedCredits < credits
    );

    const usersWithContactInfo = getUsersWithContactInfo(
      usersWithFilteredProperty
    );

    // Process the filtered user profiles into leads
    const leads: Leads[] = turnUserProfilesIntoLeads(
      usersWithContactInfo,
      scraping_id
    );

    // Add leads to the database
    await addLeadsToDatabase(leads);

    // Count leads by contact information
    const { emailCount, phoneCount } = countLeadsByContactInfo(leads);

    // Update scraping contacts information
    await editScrapingContacts(emailCount, phoneCount, scraping_id);

    // Get the user ID associated with the scraping ID
    const userId = await getUserIDByScrapingID(scraping_id);

    // Log user ID and used credits
    console.log({ userId, usedCredits });

    // Spend credits for the user
    await spendCredits(userId, usedCredits);

    // Log the length of usersWithFilteredProperty
    console.log({
      usersWithFilteredPropertyLength: usersWithFilteredProperty.length,
    });

    // Return the final list of filtered user profiles
    return usersWithFilteredProperty;
  } catch (error) {
    console.error({ error });
    // Return an appropriate response for the error
    return new Response("Bad request", { status: 500 });
  }
};

export const getLimitedLikesByProperties = async ({
  code_or_id_or_url,
  amount,
  scraping_id,
  filterProperty,
  credits,
}: LimitedInteractionDetails): Promise<UserProfile[]> => {
  const usersWithFilteredProperty: UserProfile[] = [];
  let paginationToken: string | undefined = undefined;
  let usedCredits = 0;

  try {
    while (
      usersWithFilteredProperty.length < amount &&
      paginationToken !== null &&
      usedCredits < credits
    ) {
      const { data }: any = await instaInstance.get("/likes", {
        params: {
          code_or_id_or_url,
          pagination_token: paginationToken,
        },
      });

      const nextPageToken = data.pagination_token;
      const { items } = data.data;
      const filteredPublicUsers: User[] = items
        .filter((user: any) => !user.is_private)
        .map((user: any) => ({
          id: user.id,
          userName: user.username,
          full_name: user.full_name,
          profile_pic_url: user.profile_pic_url,
          is_private: user.is_private,
        }));

      for (const { id, ...rest } of filteredPublicUsers) {
        if (
          usedCredits >= credits ||
          usersWithFilteredProperty.length >= amount
        ) {
          break; // Exit the loop if credits are exhausted or desired amount is reached
        }

        usedCredits++;
        const userInfo = await retrieveUserInfo(id);

        if (userInfo) {
          if (filterProperty && userInfo[filterProperty]) {
            const userProfile: UserProfile = {
              ...rest,
              ...userInfo,
            };
            usersWithFilteredProperty.push(userProfile);
          } else if (!filterProperty) {
            usersWithFilteredProperty.push(userInfo);
          }
        }
      }

      console.log({ usedCredits, lenght: usersWithFilteredProperty.length });

      // Update pagination token for the next iteration
      paginationToken = nextPageToken;
    }

    const usersWithContactInfo = getUsersWithContactInfo(
      usersWithFilteredProperty
    );
    const leads: Leads[] = turnUserProfilesIntoLeads(
      usersWithContactInfo,
      scraping_id
    );

    await addLeadsToDatabase(leads);

    const { emailCount, phoneCount } = countLeadsByContactInfo(leads);

    await editScrapingContacts(emailCount, phoneCount, scraping_id);

    const userId = await getUserIDByScrapingID(scraping_id);

    // Log user ID and used credits
    console.log({ userId, usedCredits });

    // Spend credits for the user
    await spendCredits(userId, usedCredits);

    console.log({
      usersWithFilteredPropertyLenght: usersWithFilteredProperty.length,
    });

    return usersWithFilteredProperty;
  } catch (error) {
    console.error({ error });
    // Re-throw the error for higher-level error handling
    throw error;
  }
};

export const getFilteredUsersFromComments = async ({
  code_or_id_or_url,
  amount,
  scraping_id,
  filterProperty,
  credits,
}: LimitedInteractionDetails) => {
  let uniqueUsers: Set<string> = new Set();
  let usersWithFilteredProperty: UserProfile[] = [];
  let paginationToken: string | undefined = undefined;
  let usedCredits = 0;

  try {
    do {
      const { data }: any = await instaInstance.get("/comments", {
        params: { code_or_id_or_url, pagination_token: paginationToken },
      });

      const nextPageToken = data.pagination_token;
      const comments = data.data.items.filter(
        (comment: any) => !comment.user.is_private
      );

      console.log({ commentsLength: comments.length });

      for (const comment of comments) {
        const user: User = {
          full_name: comment.user.full_name,
          userName: comment.user.username,
          id: comment.user.id,
          profile_pic_url: comment.user.profile_pic_url,
          is_verified: comment.user.is_verified,
          is_private: comment.user.is_private,
        };

        const isUserUnique = !uniqueUsers.has(user.id);

        if (
          isUserUnique &&
          usersWithFilteredProperty.length < amount &&
          usedCredits < credits
        ) {
          const userInfo = await retrieveUserInfo(user.id);

          if (
            userInfo &&
            usersWithFilteredProperty.length < amount &&
            usedCredits < credits
          ) {
            console.log(usersWithFilteredProperty.length);
            if (filterProperty && userInfo[filterProperty]) {
              usersWithFilteredProperty.push(userInfo);
            } else if (!filterProperty) {
              usersWithFilteredProperty.push(userInfo);
            }
          }
          usedCredits++;
          uniqueUsers.add(user.id);
        }
      }

      paginationToken = nextPageToken;
    } while (
      paginationToken &&
      usersWithFilteredProperty.length < amount &&
      usedCredits < credits
    );

    if (uniqueUsers.size < amount) {
      console.log("Not enough public users found.");
    }

    const usersWithContactInfo = getUsersWithContactInfo(
      usersWithFilteredProperty
    );
    const leads: Leads[] = turnUserProfilesIntoLeads(
      usersWithContactInfo,
      scraping_id
    );

    await addLeadsToDatabase(leads);
    const { emailCount, phoneCount } = countLeadsByContactInfo(leads);
    await editScrapingContacts(emailCount, phoneCount, scraping_id);

    const userId = await getUserIDByScrapingID(scraping_id);

    // Log user ID and used credits
    console.log({ userId, usedCredits });

    // Spend credits for the user
    await spendCredits(userId, usedCredits);

    return usersWithFilteredProperty;
  } catch (error) {
    console.error({ error });
    return new Response("Bad request", { status: 500 });
  }
};
