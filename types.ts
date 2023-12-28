export interface BaseUser {
  id: string;
  userName: string;
}

export interface User extends BaseUser {
  full_name: string;
  profile_pic_url: string;
  is_verified: boolean;
  is_private: boolean;
}

export interface UserProfile extends User {
  follower_count: number;
  following_count: number;
  media_count: number;
  public_phone_country_code?: string;
  public_phone_number?: string;
  contact_phone_number?: string;
  public_email?: string; // Opcional
  location?: LocationInfo; // Opcional
  external_url?: string;
}

export interface Leads extends User {
  follower_count: number;
  following_count: number;
  public_phone_country_code?: string;
  public_phone_number?: string;
  public_email?: string;
  external_url?: string;
  scraping_id: string;
}

export interface BasePost {
  id: string;
  caption: string;
  commmentsCount: number;
  likesCount: number;
  display_url: string;
  has_audio: boolean;
  is_video: boolean;
  location?: PostLocation;
  owner: BaseUser;
  tagged_users?: User[];
}

export interface Post extends BasePost {
  likes: User[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  child_comment_count: number;
  like_count: number;
  created_at_utc: number;
  text: string;
  user: User;
}

export interface LocationInfo {
  address_street: string;
  city_id: number;
  city_name: string;
  instagram_location_id: string;
  latitude: number | null;
  longitude: number | null;
  zip: string;
}

export interface PostLocation {
  address?: string;
  city?: string;
  facebook_places_id?: number;
  lat?: number;
  lng?: number;
  name?: string;
  short_name?: string;
}

export interface HashTagProfile {
  allow_following: boolean;
  id: string;
  media_count: number;
  name: string;
  profile_pic_url: string | null;
}

export interface UserRetrievalParams {
  idOrUsernameOrUrl: string;
  amount: number;
  mode: "following" | "followers";
  scraping_id: string;
}

export interface FilteredUserScanParams extends UserRetrievalParams {
  filterProperty: "public_email" | "public_phone_number";
}

export interface EmailDispatchInfo {
  refresh_token: string;
  access_token: string;
  expires: number;
  from: string;
  to: string[];
  subject: string;
  content: string;
  heading: string;
  preview: string;
}
