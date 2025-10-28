import { executeQuery } from "../config/queryHelper.js";

export const ConfigModel = {
  getConfig: async () => {
    const query = "SELECT * FROM admin_config LIMIT 1";
    const rows = await executeQuery(query);
    return rows[0];
  },

  updateConfig: async (data) => {
    const { late_grace_minutes, max_late_count, fee_grace_days, warning_limit, whatsapp_template } = data;

    const query = `
      UPDATE admin_config
      SET late_grace_minutes = ?, max_late_count = ?, fee_grace_days = ?, warning_limit = ?, whatsapp_template = ?, updated_at = NOW()
      WHERE id = 1
    `;
    await executeQuery(query, [late_grace_minutes, max_late_count, fee_grace_days, warning_limit, whatsapp_template]);
    return { message: "Configuration updated successfully" };
  },
};
