import { loadLocal, saveLocally } from "../storage/DataStorage";
export async function toggleAutolog(userId) {
  let current = await loadLocal(userId + "autolog");
  let updated = !current;
  await saveLocally(userId + "autolog", boolean);
  return updated;
}
