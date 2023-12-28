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
  scraping_id: number
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
  scraping_id: number
): Leads[] =>
  users.map((user) => createUserLeadsFromProfile(user, scraping_id));

export const addLeadsToDatabase = async (leads: Leads[]) => {
  try {
    const { data, error } = await supabase.from("leads").insert(leads).select();
    if (error) {
      console.error({ error });
      throw new Error(error.message);
    }
    console.log("Leads added to database successfully");

    return true;
  } catch (error) {
    return false;
  }
};

export const countLeadsByContactInfo = (
  leads: Leads[]
): { emailCount: number; phoneCount: number } => {
  let emailCount = leads.filter((lead) => lead.public_email).length;
  let phoneCount = leads.filter(
    (lead) => lead.public_phone_country_code && lead.public_phone_number
  ).length;
  return { emailCount, phoneCount };
};

export const editScrapingContacts = async (
  emailCount: number,
  phoneCount: number,
  scraping_id: number
) => {
  try {
    const { error } = await supabase
      .from("scrapings")
      .update({ phone_numbers: phoneCount, emails: emailCount })
      .eq("id", scraping_id)
      .select();
    if (error) {
      console.error({ error });
      throw new Error(error.message);
    }
    console.log(`Scraping row with ID: ${scraping_id} has been successfully modified 🎉`);
  } catch (error) {
    console.error(error);
    throw new Error((error as any).message);
  }
};
