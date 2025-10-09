import SessionToken from "../tokens/SessionToken.js";
import { saveSession, loadSession } from "../storage/DataStorage.js";
import {
  base64ToArrayBuffer,
  arrayBufferToBase64,
} from "../storage/DataConvertors.js";
class Session {
  constructor(kdf, aesgcm) {
    this.kdf = kdf;
    this.aesgcm = aesgcm;
  }

  async createSessionToken(masterKeyBase, userID, userNameHash) {
    let sessionKeyBase = await this.kdf.generateRandom(16);
    let sessionSalt = await this.kdf.generateRandom(16);
    let sessionIv = await this.kdf.generateRandom(16);
    const sessionKey = await this.kdf.PBKDF2KeyGen(sessionKeyBase, sessionSalt);
    const encryptedKey = await this.aesgcm.encryptString(
      masterKeyBase,
      sessionKey,
      sessionIv
    );
    const storableKey = arrayBufferToBase64(encryptedKey);
    return new SessionToken(
      userID,
      userNameHash,
      sessionSalt,
      sessionIv,
      sessionKeyBase,
      storableKey
    );
  }

  async storeSession(sessionToken) {
    await saveSession("session", sessionToken);
  }

  async getSession() {
    return await loadSession("session");
  }

  async getSessionKey(sessionToken) {
    return await this.kdf.PBKDF2KeyGen(
      sessionToken.sessionKeyBase,
      sessionToken.sessionSalt
    );
  }

  async decryptMasterKey(sessiontoken) {
    const sessionKey = await this.getSessionKey(sessiontoken);
    const buffer = base64ToArrayBuffer(sessiontoken.storableKey);
    return await this.aesgcm.decryptString(
      buffer,
      sessionKey,
      sessiontoken.sessionIv
    );
  }
}
export default Session;
