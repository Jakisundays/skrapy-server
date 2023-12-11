import { Comment, User } from "../types";
import { instaInstance } from "../utils/instaInstance";

export const getAllFollowers = async (idOrUsernameOrUrl: string) => {
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
      const { items } = data.data;

      const filteredUsers: User[] = items
        // .filter((user: any) => !user.is_private)
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

export const getAllFollowing = async (idOrUsernameOrUrl: string) => {
  try {
    let allUsers: User[] = [];
    let paginationToken: string | undefined = undefined;

    do {
      const { data }: any = await instaInstance.get("/following", {
        params: {
          username_or_id_or_url: idOrUsernameOrUrl,
          pagination_token: paginationToken,
        },
      });

      const nextPageToken = data.pagination_token;
      const { items } = data.data;

      const filteredUsers: User[] = items
        // .filter((user: any) => !user.is_private)
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
    return allUsers;
    // return new Response(JSON.stringify(allUsers));
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
        // .filter((user: any) => !user.is_private)
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

export const getUsersByHashtag = async (hashtag: string) => {
  console.log({ hashtag });
  try {
    let allUsers: User[] = [];
    let paginationToken: string | undefined = undefined;
    do {
      const { data }: any = await instaInstance.get("/hashtag", {
        params: {
          hashtag,
        },
      });
      const nextPageToken = data.pagination_token;
      const { items } = data.data;
      // console.log({ items });allUsers
      // const filteredUsers: User[] = items.map(
      //   async (item: any) => await getLikersOfPost(item.id)
      // );
      const filteredUsers = (await getLikersOfPost(items[0].id)) as User[];
      allUsers = allUsers.concat(filteredUsers);
      paginationToken = undefined;
      // paginationToken = nextPageToken;
    } while (paginationToken);
    return allUsers;
  } catch (error) {
    console.error({ error });
    return new Response("Bad request", { status: 500 });
  }
};
