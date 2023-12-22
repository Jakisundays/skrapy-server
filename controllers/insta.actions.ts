import {
  BaseUser,
  Comment,
  FilteredUserScanParams,
  User,
  UserProfile,
  UserRetrievalParams,
} from "../types";
import { instaInstance } from "../utils/instaInstance";

export const getAllUsersByType = async ({
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
}: {
  hashtag: string;
  amount: number;
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
          const filteredUsers: UserProfile[] =
            await retrieveAmountOfUsersByLikes({
              code_or_id_or_url: items[item].id,
              amount,
            });
          allUsers = allUsers.concat(filteredUsers);
        }
      }
      paginationToken = nextPageToken;
    } while (paginationToken && allUsers.length < amount);
    return allUsers.slice(0, amount);
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

export const scanUsersForFilteredProperty = async ({
  idOrUsernameOrUrl,
  amount,
  mode,
  filterProperty = "public_email",
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

      usersWithFilteredProperty = usersWithFilteredProperty.concat(
        filteredUsersWithFilteredProperty
      );

      console.log({ usersWithFilteredProperty });

      paginationToken = nextPageToken;
    } while (paginationToken && usersWithFilteredProperty.length < amount);

    return usersWithFilteredProperty;
  } catch (error) {
    console.error({ error });
    return new Response("Bad request", { status: 500 });
  }
};

export const getAmountOfUsers = async ({
  idOrUsernameOrUrl,
  amount,
  mode,
}: UserRetrievalParams): Promise<UserProfile[]> => {
  // Initialize an array to store user profiles
  const users: UserProfile[] = [];
  // Initialize pagination token to undefined
  let paginationToken: string | undefined = undefined;

  try {
    // Loop until the desired amount of users is reached or there is no more pagination token
    while (users.length < amount && paginationToken !== null) {
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
      const filteredUsers: UserProfile[] = items
        .filter((user: any) => !user.is_private)
        .map((user: any) => ({
          id: user.id,
          userName: user.username,
          full_name: user.full_name,
          profile_pic_url: user.profile_pic_url,
          is_private: user.is_private,
        }));

      // Add filtered users to the users array
      users.push(...filteredUsers);
      // Update pagination token for the next iteration
      paginationToken = nextPageToken;
    }

    // Concurrently retrieve user profiles using Promise.all
    const userProfiles: UserProfile[] = await Promise.all(
      users.slice(0, amount).map(async (user) => {
        // Retrieve user profile information
        const userInfo = await retrieveUserInfo(user.id);
        // Throw an error if user profile is not found
        if (!userInfo) {
          throw new Error(`User not found: ${user.userName} (${user.id})`);
        }
        // Return the user profile information
        return userInfo;
      })
    );

    // Log successful user profiles retrieval
    console.log(
      "User profile retrieval successful. Total profiles:",
      userProfiles.length
    );
    // Return the user profiles
    return userProfiles;
  } catch (error) {
    // Log any errors that occur during the process
    console.error({ error });
    // Re-throw the error for higher-level error handling
    throw error;
  }
};

export const retrieveAmountOfUsersByLikes = async ({
  code_or_id_or_url,
  amount,
}: {
  code_or_id_or_url: string;
  amount: number;
}): Promise<UserProfile[]> => {
  // Initialize an array to store user profiles
  const users: User[] = [];
  // Initialize pagination token to undefined
  let paginationToken: string | undefined = undefined;
  try {
    while (users.length < amount && paginationToken !== null) {
      const { data }: any = await instaInstance.get("/likes", {
        params: {
          code_or_id_or_url,
          pagination_token: paginationToken,
        },
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
      users.push(...userList);
      paginationToken = nextPageToken;
    }

    const userProfiles: UserProfile[] = (
      await Promise.all(
        users.slice(0, amount).map(async (user) => {
          // Retrieve user profile information
          const userInfo = await retrieveUserInfo(user.id);
          // Return the user profile information or null
          return userInfo;
        })
      )
    ).filter((profile): profile is UserProfile => profile !== null);

    // Use Promise.all again to wait for all promises to resolve
    const filteredUserProfiles: UserProfile[] = await Promise.all(
      userProfiles.filter((profile: UserProfile | null) => profile !== null)
    );

    return filteredUserProfiles;
  } catch (error) {
    console.error({ error });
    // Re-throw the error for higher-level error handling
    throw error;
  }
};

export const retrieveUsersByComments = async ({
  code_or_id_or_url,
  amount,
}: {
  code_or_id_or_url: string;
  amount: number;
}) => {
  let users: User[] = [];
  let userProfiles: UserProfile[] = [];
  let paginationToken: string | undefined = undefined;
  let allComments: Comment[] = [];
  try {
    do {
      const { data }: any = await instaInstance.get("/comments", {
        params: { code_or_id_or_url, pagination_token: paginationToken },
      });
      const nextPageToken = data.pagination_token;
      const { items } = data.data;

      const comments: Comment[] = items
        .filter((comment: any) => !comment.user.is_private)
        .map(async (comment: any) => {
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
      allComments = allComments.concat(comments);
      paginationToken = nextPageToken;
    } while (paginationToken && users.length < amount);
    if (users.length < amount) {
      console.log("Not enough public users found.");
    }
    console.log({ userProfiles, legnht: userProfiles.length });
    return userProfiles;
  } catch (error) {
    console.error({ error });
    return new Response("Bad request", { status: 500 });
  }
};
