import KDF from "../security/KDF.js";
import AESGCM from "../security/Encryption.js";
import { base64ToArrayBuffer } from "../storage/DataConvertors.js";
import { loadLocal } from "../storage/DataStorage.js";
import Session from "../session/Session.js";
import ResponseCodes from "./ResponseCodes.js";

const responseCodes = new ResponseCodes();
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const pbkdf2 = new KDF(textEncoder);
const aesgcm = new AESGCM(textEncoder, textDecoder);
const session = new Session(pbkdf2, aesgcm);

export async function login(usernameAndPassword) {
  const usernameHash = await pbkdf2.hashWithSHA256(
    usernameAndPassword.username
  );
  const userToken = await loadLocal(usernameHash);
  if (!userToken) {
    return responseCodes.noUserFound;
  }
  const decryptedMasterKey = await decryptMasterKey(
    userToken,
    usernameAndPassword.password
  );
  const validated = validatePassword(
    userToken.masterKeySalt,
    usernameAndPassword.password,
    decryptedMasterKey
  );
  if (validated != responseCodes.allClear) {
    return responseCodes.incorrectPassword;
  }
  const sessionToken = await session.createSessionToken(
    saltedMasterKey,
    userId
  );

  await session.storeSession(sessionToken);

  return responseCodes.allClear;
}

export async function decryptMasterKey(userToken, password) {
  const encryptedPassword = base64ToArrayBuffer(userToken.masterKey);
  const decryptionKey = await pbkdf2.PBKDF2KeyGen(
    password,
    userToken.masterKeyEncryptionSalt
  );
  return await aesgcm.decryptString(
    encryptedPassword,
    decryptionKey,
    userToken.encryptionIV
  );
}

export async function validatePassword(masterKeySalt, password, decryptedMasterKey) {
  const currentKey = await pbkdf2.hashWithSHA256(password, masterKeySalt);
  if (!decryptedMasterKey || decryptedMasterKey != currentKey) {
    return responseCodes.incorrectPassword;
  }
  return responseCodes.allClear;
}
