import axios from "axios";
import { UserInfoResponse } from "./types.js";

export const getUserInfoService = async (accessToken: string) => {
  try {
    const { data } = await axios.get<UserInfoResponse>(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return data;
  } catch (error) {
    throw error;
  }
};
