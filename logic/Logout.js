import {
  deleteSessionEntry,
  deleteLocalEntry,
  loadSession,
  loadLocal,
} from "../storage/DataStorage.js";
import ResponseCodes from "./ResponseCodes.js";
import { decryptMasterKey, validatePassword } from "./Login.js";

const responseCodes = new ResponseCodes();

export async function logout() {
  await deleteSessionEntry("session");
}

export async function deleteUser(susPass) {
  const sessionToken = await loadSession("session");
  const userToken = await loadLocal(sessionToken.userNameHash);
  const decryptedPass = await decryptMasterKey(userToken, susPass);
  const response = await validatePassword(
    userToken.masterKeySalt,
    susPass,
    decryptedPass
  );
  if (!response == responseCodes.allClear) {
    deleteSessionEntry("session");
    return responseCodes.incorrectPassword;
  }
  //await deleteLocalEntry(sessionToken.userId); //deletes storedd passwords
  await deleteLocalEntry(sessionToken.userId + "autolog"); // deletes autologin switch
  await deleteLocalEntry(sessionToken.userNameHash); //deletes account
  deleteSessionEntry("session"); //deletes session
  return responseCodes.allClear;
}
