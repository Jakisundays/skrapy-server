import { getLimitedLikes, retrieveUserInfo } from "./controllers/insta.actions";
import {
  BaseUser,
  FilteredUserScanParams,
  Leads,
  User,
  UserProfile,
} from "./types";
import {
  addLeadsToDatabase,
  countLeadsByContactInfo,
  editScrapingContacts,
  getUserIDByScrapingID,
  getUsersWithContactInfo,
  spendCredits,
  turnUserProfilesIntoLeads,
} from "./utils/database-helpers";
import { instaInstance } from "./utils/instaInstance";

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
