import { instaInstance } from "./instaInstance";

export const getLikesOfPost = async (id: string) => {
  const { data }: any = await instaInstance.get('');
};
