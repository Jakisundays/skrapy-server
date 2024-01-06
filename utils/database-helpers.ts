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
  if (leads.length > 0) {
    try {
      const { error } = await supabase.from("leads").insert(leads).select();
      if (error) {
        console.error({ error });
        throw new Error(error.message);
      }
      console.log("Leads added to database successfully");
    } catch (error) {
      console.error(error);
      throw new Error("Failed to add leads to the database");
    }
  }else{
    console.warn('No leads to be saved in the database');
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
    console.log(
      `Scraping row with ID: ${scraping_id} has been successfully modified 🎉`
    );
  } catch (error) {
    console.error(error);
    throw new Error((error as any).message);
  }
};

export const getUserIDByScrapingID = async (scraping_id: number) => {
  const { data: scraping_data, error } = await supabase
    .from("scrapings")
    .select("user_id")
    .eq("id", scraping_id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return scraping_data.user_id;
};

export const spendCredits = async (user_id: string, usedCredits: number) => {
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("used_credits, credits")
    .eq("id", user_id)
    .single();

  if (userError) {
    throw new Error(userError.message);
  }

  const { used_credits, credits } = userData;

  const accumulatedUsedCredits = used_credits + usedCredits;

  const remainingCredits = credits - usedCredits;

  const { error: updateError } = await supabase
    .from("users")
    .update({ used_credits: accumulatedUsedCredits, credits: remainingCredits })
    .eq("id", user_id)
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }
};
