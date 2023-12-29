import {
  BaseUser,
  Comment,
  FilteredUserScanParams,
  Leads,
  User,
  UserProfile,
  UserRetrievalParams,
} from "../types";
import {
  addLeadsToDatabase,
  countLeadsByContactInfo,
  editScrapingContacts,
  getUsersWithContactInfo,
  turnUserProfilesIntoLeads,
} from "../utils/database-helpers";
import { instaInstance } from "../utils/instaInstance";

export const retrieveUserConnections = async ({
  mode,
  idOrUsernameOrUrl,
}: {
  idOrUsernameOrUrl: string;
  mode: "followers" | "following";
}) => {
  try {
    let allUsers: UserProfile[] = [];
    let paginationToken: string | undefined = undefined;

    do {
      const { data }: any = await instaInstance.get(`/${mode}`, {
        params: {
          username_or_id_or_url: idOrUsernameOrUrl,
          pagination_token: paginationToken,
        },
      });

      const nextPageToken = data.pagination_token;
      const { items } = data.data;

      const filteredUsers: User[] = items
        .filter((user: any) => !user.is_private)
        .map((user: any) => ({
          id: user.id,
          userName: user.username,
          full_name: user.full_name,
          profile_pic_url: user.profile_pic_url,
          is_verified: user.is_verified,
          is_private: user.is_private,
        }));

      const usersWithInfo: UserProfile[] = await Promise.all(
        filteredUsers.map(async (user: User) => {
          const userInfo = await retrieveUserInfo(user.id);
          if (!userInfo) {
            throw new Error("No se pudo obtener la información del usuario.");
          }
          return userInfo;
        })
      );

      allUsers = allUsers.concat(usersWithInfo);
      paginationToken = nextPageToken;
    } while (paginationToken);
    return allUsers;
  } catch (error) {
    console.error({ error });
    return new Response("Bad request", { status: 500 });
  }
};

export const getLikersOfPost = async (code_or_id_or_url: string) => {
  try {
    let allUsers: User[] = [];
    let paginationToken: string | undefined = undefined;
    do {
      const { data }: any = await instaInstance.get("/likes", {
        params: { code_or_id_or_url, pagination_token: paginationToken },
      });
      const nextPageToken = data.pagination_token;
      const { items } = data.data;
      const userList: User[] = items
        .filter((user: any) => !user.is_private)
        .map((user: any) => ({
          full_name: user.full_name,
          id: user.id,
          profile_pic_url: user.profile_pic_url,
          is_verified: user.is_verified,
          userName: user.username,
          is_private: user.is_private,
        }));
      allUsers = allUsers.concat(userList);
      paginationToken = nextPageToken;
    } while (paginationToken);
    // console.log({ length: allUsers.length });
    return allUsers;
  } catch (error) {
    console.error({ error });
    return new Response("Bad request", { status: 500 });
  }
};

export const getCommentsOnPost = async (code_or_id_or_url: string) => {
  console.log({ code_or_id_or_url });
  try {
    let allComments: Comment[] = [];
    let paginationToken: string | undefined = undefined;
    let totalComments;
    do {
      const { data }: any = await instaInstance.get("/comments", {
        params: { code_or_id_or_url, pagination_token: paginationToken },
      });
      const nextPageToken = data.pagination_token;
      const { items, total } = data.data;
      totalComments = total;
      const comments: Comment[] = items.map((comment: any) => ({
        id: comment.id,
        child_comment_count: comment.child_comment_count,
        like_count: comment.like_count,
        created_at_utc: comment.created_at_utc,
        text: comment.text,
        user: {
          full_name: comment.user.full_name,
          userName: comment.user.username,
          id: comment.user.id,
          profile_pic_url: comment.user.profile_pic_url,
          is_verified: comment.user.is_verified,
          is_private: comment.user.is_private,
        },
      }));
      allComments = allComments.concat(comments);
      paginationToken = nextPageToken;
    } while (paginationToken);
    return allComments;
  } catch (error) {
    console.error({ error });
    return new Response("Bad request", { status: 500 });
  }
};

export const retrieveUsersByHashtag = async ({
  hashtag,
  amount,
  scraping_id,
}: {
  hashtag: string;
  amount: number;
  scraping_id: number;
}) => {
  try {
    let allUsers: UserProfile[] = [];
    let paginationToken: string | undefined = undefined;
    do {
      const { data }: any = await instaInstance.get("/hashtag", {
        params: {
          hashtag,
        },
      });

      const nextPageToken = data.pagination_token;
      const { items } = data.data;
      for (const item in items) {
        if (allUsers.length < amount) {
          const filteredUsers: UserProfile[] = await getLimitedLikes({
            code_or_id_or_url: items[item].id,
            amount,
          });
          allUsers = allUsers.concat(filteredUsers);
        }
      }
      paginationToken = nextPageToken;
    } while (paginationToken && allUsers.length < amount);

    const usersWithContactInfo = getUsersWithContactInfo(allUsers);
    const leads: Leads[] = turnUserProfilesIntoLeads(
      usersWithContactInfo,
      scraping_id
    );

    await addLeadsToDatabase(leads);

    const { emailCount, phoneCount } = countLeadsByContactInfo(leads);

    await editScrapingContacts(emailCount, phoneCount, scraping_id);

    console.log({ lenght: allUsers.length });

    return allUsers;
  } catch (error) {
    console.error({ error });
    return new Response("Bad request", { status: 500 });
  }
};

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

export const filterByProperties = async ({
  idOrUsernameOrUrl,
  amount,
  mode,
  filterProperty,
  scraping_id,
}: FilteredUserScanParams) => {
  try {
    let usersWithFilteredProperty: UserProfile[] = [];
    let paginationToken: string | undefined = undefined;

    do {
      const { data }: any = await instaInstance.get(`/${mode}`, {
        params: {
          username_or_id_or_url: idOrUsernameOrUrl,
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
          is_verified: user.is_verified,
          is_private: user.is_private,
        }));

      const filteredUsersWithFilteredProperty: UserProfile[] = (
        await Promise.all(
          filteredPublicUsers.map(async ({ id, ...rest }: BaseUser) => {
            const userInfo = await retrieveUserInfo(id);

            if (userInfo && userInfo[filterProperty]) {
              const userProfile: UserProfile = {
                ...rest,
                ...userInfo,
              };

              return userProfile;
            } else {
              return null;
            }
          })
        )
      ).filter(Boolean) as UserProfile[];

      console.log({ filteredUsersWithFilteredProperty });

      if (filteredUsersWithFilteredProperty) {
        filteredUsersWithFilteredProperty.forEach((user) =>
          usersWithFilteredProperty.push(user)
        );
      }
      // usersWithFilteredProperty.concat(filteredUsersWithFilteredProperty);

      console.log({
        usersWithFilteredProperty,
        lenght: usersWithFilteredProperty.length,
      });

      paginationToken = nextPageToken;
    } while (paginationToken && usersWithFilteredProperty.length < amount);

    const leads: Leads[] = turnUserProfilesIntoLeads(
      usersWithFilteredProperty,
      scraping_id
    );

    await addLeadsToDatabase(leads);

    const { emailCount, phoneCount } = countLeadsByContactInfo(leads);

    await editScrapingContacts(emailCount, phoneCount, scraping_id);

    return usersWithFilteredProperty;
  } catch (error) {
    console.error({ error });
    return new Response("Bad request", { status: 500 });
  }
};

export const getLimitedAmount = async ({
  idOrUsernameOrUrl,
  amount,
  mode,
  scraping_id,
}: UserRetrievalParams): Promise<UserProfile[]> => {
  console.log({ idOrUsernameOrUrl, amount, mode, scraping_id });
  // Initialize an array to store user profiles
  const userProfiles: UserProfile[] = [];
  // Initialize pagination token to undefined
  let paginationToken: string | undefined = undefined;

  try {
    // Loop until the desired amount of users is reached or there is no more pagination token
    while (userProfiles.length < amount && paginationToken !== null) {
      // Make an API request to get user data
      const { data }: any = await instaInstance.get(`/${mode}`, {
        params: {
          username_or_id_or_url: idOrUsernameOrUrl,
          pagination_token: paginationToken,
        },
      });

      // Extract pagination token and user items from the API response
      const nextPageToken = data.pagination_token;
      const { items } = data.data;

      // Filter and map user data to UserProfile type
      const filteredUsers: User[] = items
        .filter((user: any) => !user.is_private)
        .map((user: any) => ({
          id: user.id,
          userName: user.username,
          full_name: user.full_name,
          profile_pic_url: user.profile_pic_url,
          is_private: user.is_private,
        }));

      for (const user of filteredUsers) {
        const userInfo = await retrieveUserInfo(user.id);
        if (userInfo) {
          userProfiles.push(userInfo);
        } else {
          console.log(
            `User profile not found for user with USERNAME: ${user.userName}`
          );
        }

        // Check if the desired amount of users has been reached
        if (userProfiles.length >= amount) {
          break; // Exit the loop if the desired amount has been reached
        }
      }

      // Update pagination token for the next iteration
      paginationToken = nextPageToken;
    }
    const usersWithContactInfo = getUsersWithContactInfo(userProfiles);
    const leads: Leads[] = turnUserProfilesIntoLeads(
      usersWithContactInfo,
      scraping_id
    );

    await addLeadsToDatabase(leads);

    const { emailCount, phoneCount } = countLeadsByContactInfo(leads);

    await editScrapingContacts(emailCount, phoneCount, scraping_id);

    // Return the user profiles
    return userProfiles;
  } catch (error) {
    // Log any errors that occur during the process
    console.error({ error });
    // Re-throw the error for higher-level error handling
    throw error;
  }
};

export const getLimitedLikes = async ({
  code_or_id_or_url,
  amount,
  scraping_id,
}: {
  code_or_id_or_url: string;
  amount: number;
  scraping_id?: number;
}): Promise<UserProfile[]> => {
  const userProfiles: UserProfile[] = [];
  let paginationToken: string | undefined = undefined;

  try {
    while (userProfiles.length < amount && paginationToken !== null) {
      const { data }: any = await instaInstance.get("/likes", {
        params: {
          code_or_id_or_url,
          pagination_token: paginationToken,
        },
      });

      const nextPageToken = data.pagination_token;
      const { items } = data.data;
      const filteredUsers: User[] = items
        .filter((user: any) => !user.is_private)
        .map((user: any) => ({
          id: user.id,
          userName: user.username,
          full_name: user.full_name,
          profile_pic_url: user.profile_pic_url,
          is_private: user.is_private,
        }));

      for (const user of filteredUsers) {
        const userInfo = await retrieveUserInfo(user.id);
        if (userInfo) {
          userProfiles.push(userInfo);
        } else {
          console.log(
            `User profile not found for user with USERNAME: ${user.userName}`
          );
        }

        console.log({ userProfiles: userProfiles.length });
        // Check if the desired amount of users has been reached
        if (userProfiles.length >= amount) {
          break; // Exit the loop if the desired amount has been reached
        }
      }

      // Update pagination token for the next iteration
      paginationToken = nextPageToken;
    }
    if (scraping_id) {
      console.log("saving leads on database");
      const usersWithContactInfo = getUsersWithContactInfo(userProfiles);
      const leads: Leads[] = turnUserProfilesIntoLeads(
        usersWithContactInfo,
        scraping_id
      );

      await addLeadsToDatabase(leads);

      const { emailCount, phoneCount } = countLeadsByContactInfo(leads);

      await editScrapingContacts(emailCount, phoneCount, scraping_id);
    } else {
      console.log("Scraping_id missing, not saving in the database. 🚫💾");
    }
    console.log({ userProfilesLenght: userProfiles.length });
    return userProfiles;
  } catch (error) {
    console.error({ error });
    // Re-throw the error for higher-level error handling
    throw error;
  }
};

export const retrieveUsersByComments = async ({
  code_or_id_or_url,
  amount,
  scraping_id,
}: {
  code_or_id_or_url: string;
  amount: number;
  scraping_id: number;
}) => {
  let users: User[] = [];
  let userProfiles: UserProfile[] = [];
  let paginationToken: string | undefined = undefined;
  try {
    do {
      const { data }: any = await instaInstance.get("/comments", {
        params: { code_or_id_or_url, pagination_token: paginationToken },
      });
      const nextPageToken = data.pagination_token;
      const { items } = data.data;

      items
        .filter((comment: any) => !comment.user.is_private)
        .forEach(async (comment: any) => {
          const newComment = {
            id: comment.id,
            child_comment_count: comment.child_comment_count,
            like_count: comment.like_count,
            created_at_utc: comment.created_at_utc,
            text: comment.text,
            user: {
              full_name: comment.user.full_name,
              userName: comment.user.username,
              id: comment.user.id,
              profile_pic_url: comment.user.profile_pic_url,
              is_verified: comment.user.is_verified,
              is_private: comment.user.is_private,
            },
          };
          if (!users.includes(newComment.user) && users.length < amount) {
            const newUser = await retrieveUserInfo(newComment.user.id);
            if (
              newUser &&
              !userProfiles.includes(newUser) &&
              userProfiles.length < amount
            ) {
              userProfiles.push(newUser);
            }
            users.push(newComment.user);
          }
          return newComment;
        });

      paginationToken = nextPageToken;
    } while (paginationToken && users.length < amount);
    if (users.length < amount) {
      console.log("Not enough public users found.");
    }
    const usersWithContactInfo = getUsersWithContactInfo(userProfiles);
    const leads: Leads[] = turnUserProfilesIntoLeads(
      usersWithContactInfo,
      scraping_id
    );

    await addLeadsToDatabase(leads);
    const { emailCount, phoneCount } = countLeadsByContactInfo(leads);
    await editScrapingContacts(emailCount, phoneCount, scraping_id);

    return userProfiles;
  } catch (error) {
    console.error({ error });
    return new Response("Bad request", { status: 500 });
  }
};
