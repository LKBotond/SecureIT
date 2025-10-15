import { loadLocal, loadSession, saveLocally } from "../storage/DataStorage.js";
export async function toggleAutolog() {
  const sessionToken = await loadSession("session");
  let current = await loadLocal(sessionToken.userId + "autolog");
  let updated = !current;
  await saveLocally(sessionToken.userId + "autolog", updated);
  return updated;
}

export async function getAutolog() {
  const sessionToken = await loadSession("session");
  let current = await loadLocal(sessionToken.userId + "autolog");
  return current;
}
