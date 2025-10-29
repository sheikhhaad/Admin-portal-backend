import { executeQuery } from "../config/queryHelper.js";

export const TokenModel = {
  blacklistToken: async (token) => {
    await executeQuery("INSERT INTO token_blacklist (token) VALUES (?)", [token]);
  },

  isTokenBlacklisted: async (token) => {
    const result = await executeQuery(
      "SELECT * FROM token_blacklist WHERE token = ?",
      [token]
    );
    return result.length > 0;
  },
};
