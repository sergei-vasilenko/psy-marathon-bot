import { getConfigKey } from "../utils.js";

const roleModel = [
  { role: "support", members: new Set([getConfigKey("SUPPORT_ID")]) },
  { role: "admin", members: new Set([getConfigKey("ADMIN_ID")]) },
  { role: "user", members: "any" },
];

export default roleModel;
