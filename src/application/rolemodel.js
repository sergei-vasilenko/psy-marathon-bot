import { getConfigKey } from "../utils.js";

const roleModel = [
  { role: "support", members: new Set([getConfigKey("SUPPORT_ID")]) },
  { role: "admin", members: new Set(getConfigKey("ADMIN_IDS").split(",")) },
  { role: "user", members: "any" },
];

export default roleModel;
