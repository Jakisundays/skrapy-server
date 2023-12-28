import { supabase } from "../libs/supabase";
import { Leads, UserProfile } from "../types";

export const getUsersWithContactInfo = (users: UserProfile[]): UserProfile[] =>
  users.filter(
    ({ public_email, public_phone_number, public_phone_country_code }) =>
      public_email || (public_phone_number && public_phone_country_code)
  );

export const createUserLeadsFromProfile = (
  {
    id,
    userName,
    full_name,
    profile_pic_url,
    is_verified,
    is_private,
    follower_count,
    following_count,
    public_phone_country_code,
    public_phone_number,
    public_email,
    external_url,
  }: UserProfile,
  scraping_id: string
): Leads => ({
  id,
  userName,
  full_name,
  profile_pic_url,
  is_verified,
  is_private,
  follower_count,
  following_count,
  public_phone_country_code,
  public_phone_number,
  public_email,
  external_url,
  scraping_id,
});

export const turnUserProfilesIntoLeads = (
  users: UserProfile[],
  scraping_id: string
): Leads[] =>
  users.map((user) => createUserLeadsFromProfile(user, scraping_id));

export const addLeadsToDatabase = async (leads: Leads[]) => {
  console.log({ leads });
  try {
    const { data, error } = await supabase.from("leads").insert(leads).select();
    if (error) {
      console.error({ error });
      throw new Error(error.message);
    }
    console.log({ data });
    console.log("Leads added to database successfully");

    return true;
  } catch (error) {
    return false;
  }
};
