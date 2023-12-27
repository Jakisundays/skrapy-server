import { supabase } from "../libs/supabase";
import { UserProfile } from "../types";

export const getUsersWithContactInfo = (users: UserProfile[]): UserProfile[] =>
  users.filter(
    ({
      public_email,
      public_phone_number,
      public_phone_country_code,
      contact_phone_number,
    }) =>
      public_email ||
      (public_phone_number && public_phone_country_code) ||
      contact_phone_number
  );

// Arreglar tabla
// Insertar scraping_id a cada user
// ponselo a las funciones y test

// export const addLeadsToDatabase = async (
//   users: UserProfile[],
//   scraping_id: string
// ) => {
//   try {
//     const { data, error } = await supabase.from("leads").insert(users).select();
//     if(error){
//         console.error({error})
//         throw new Error(error.message)
//     }
//     return 
//   } catch (error) {}
// };
