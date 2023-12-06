import { User } from "../types";
import { instaInstance } from "./instaInstance";

export const getAllFollowers = async (
  idOrUsernameOrUrl: string,
  amount = 500
) => {
  try {
    let allUsers: User[] = [];
    let paginationToken: string | undefined = undefined;

    do {
      const { data }: any = await instaInstance.get("/followers", {
        params: {
          username_or_id_or_url: idOrUsernameOrUrl,
          pagination_token: paginationToken,
        },
      });

      const nextPageToken = data.pagination_token;
      console.log({ nextPageToken });
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

      allUsers = allUsers.concat(filteredUsers);
      paginationToken = nextPageToken;
    } while (paginationToken);

    return new Response(JSON.stringify(allUsers));
  } catch (error) {
    console.error({ error });
    return new Response("Bad request", { status: 500 });
  }
};
