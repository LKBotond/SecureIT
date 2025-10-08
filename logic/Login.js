import KDF from "../security/KDF.js";
import AESGCM from "../security/Encryption.js";
import UserToken from "../tokens/UserToken.js";
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from "../SecureIT/Encrypt/Encrypt.js";
import { loadLocal } from "../storage/DataStorage.js";
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
    return responseCodes.noUserFound();
  }
  const decryptedMasterKey = await decryptMasterKey(userToken, password);
  const validated = validatePassword(
    userToken.masterKeySalt,
    password,
    decryptedMasterKey
  );
  if (validated != responseCodes.allClear()) {
    return responseCodes.incorrectPassword();
  }

  return responseCodes.allClear();
}

async function decryptMasterKey(userToken, password) {
  const base64EncryptedPassOnRecord = userToken.base64MasterKey;
  const encryptedPassword = base64ToArrayBuffer(base64EncryptedPassOnRecord);
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

async function validatePassword(masterKeySalt, password, decryptedMasterKey) {
  const currentKey = await pbkdf2.hashWithSHA256(password, masterKeySalt);
  if (!decryptedMasterKey || decryptedMasterKey != currentKey) {
    return responseCodes.incorrectPassword();
  }

  const sessionToken = await session.createSessionToken(
    saltedMasterKey,
    userId
  );

  await session.storeSession(sessionToken);
  
  return responseCodes.allClear();
}
