import { retrieveUserInfo } from "./controllers/insta.actions";
import { BaseUser, User, UserProfile } from "./types";
import { instaInstance } from "./utils/instaInstance";

interface GetAmountOfUsersParams {
  idOrUsernameOrUrl: string;
  amount: number;
  mode: "following" | "followers";
}

// Function to retrieve a specific amount of user profiles based on given parameters
export const getAmountOfUsers = async ({
  idOrUsernameOrUrl,
  amount,
  mode,
}: GetAmountOfUsersParams): Promise<UserProfile[]> => {
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

getAmountOfUsers({
  idOrUsernameOrUrl: "leomessi",
  amount: 66,
  mode: "followers",
});
