import KDF from "../security/KDF.js";
import AESGCM from "../security/Encryption.js";
import UserToken from "../tokens/UserToken.js";
import { arrayBufferToBase64 } from "../storage/DataConvertors.js";
import { saveLocally } from "../storage/DataStorage.js";
import ResponseCodes from "./ResponseCodes.js";
import Session from "../session/Session.js";

const responseCodes = new ResponseCodes();
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const pbkdf2 = new KDF(textEncoder);
const aesgcm = new AESGCM(textEncoder, textDecoder);
const session = new Session(pbkdf2, aesgcm);

export async function register(usernameAndPassword) {
  const masterKeySalt = await pbkdf2.generateRandom(16);
  const saltedMasterKey = await pbkdf2.hashWithSHA256(
    usernameAndPassword.password,
    masterKeySalt
  );
  const masterKeyEncryptionSalt = await pbkdf2.generateRandom(16);
  const encryptionKey = await pbkdf2.PBKDF2KeyGen(
    usernameAndPassword.password,
    masterKeyEncryptionSalt
  );

  const encryptionIV = await pbkdf2.generateRandom(16);
  const encryptedPassword = await aesgcm.encryptString(
    saltedMasterKey,
    encryptionKey,
    encryptionIV
  );

  const base64MasterKey = arrayBufferToBase64(encryptedPassword);
  const userId = await pbkdf2.generateRandom(16);
  const userToken = new UserToken(
    base64MasterKey,
    masterKeySalt,
    encryptionKey,
    masterKeyEncryptionSalt,
    encryptionIV,
    userId
  );

  const userNameHash = await pbkdf2.hashWithSHA256(
    usernameAndPassword.username
  );

  await saveLocally(userNameHash, userToken);
  await saveLocally(userId + "autolog", true);
  const sessionToken = await session.createSessionToken(
    saltedMasterKey,
    userId,
    userNameHash
  );

  await session.storeSession(sessionToken);

  return responseCodes.allClear;
}
