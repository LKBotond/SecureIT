import SessionToken from "../tokens/SessionToken";
import { saveSession, loadSession } from "../storage/DataStorage";
import {
  base64ToArrayBuffer,
  arrayBufferToBase64,
} from "../storage/DataConvertors";
class Session {
  constructor(kdf, aesgcm) {
    this.kdf = kdf;
    this.aesgcm = aesgcm;
  }

  async createSession(masterKeyBase, UserID) {
    let sessionKeyBase = await this.kdf.generateRandom(16);
    let sessionSalt = await this.kdf.generateRandom(16);
    let sessionIv = await this.kdf.generateRandom(16);
    const encryptedKey = await encryptString(masterKeyBase, sessionKey, IV);
    const storableKey = arrayBufferToBase64(encryptedKey);
    return new SessionToken(
      UserID,
      sessionKeyBase,
      sessionSalt,
      sessionIv,
      storableKey
    );
  }
  async storeSession(sessionToken) {
    let sessionId = this.kdf.generateRandom(8);
    await saveSession(sessionId, sessionToken);
    return sessionId;
  }

  async loadSession(sessionID) {
    return await loadSession(sessionID);
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
