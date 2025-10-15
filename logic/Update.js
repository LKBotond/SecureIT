import { loadLocal, loadSession, saveLocally } from "../storage/DataStorage.js";
import Session from "../session/Session.js";
import KDF from "../security/KDF.js";
import AESGCM from "../security/Encryption.js";
import CredentialToken from "../tokens/CredentialToken.js";
import { arrayBufferToBase64 } from "../storage/DataConvertors.js";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const pbkdf2 = new KDF(encoder);
const aesgcm = new AESGCM(encoder, decoder);
const session = new Session(pbkdf2, aesgcm);

export async function updateRecords(username, password, url) {
  const sessionToken = await loadSession("session");

  const nameIv = await pbkdf2.generateRandom();
  const passIv = await pbkdf2.generateRandom();
  const passSalt = await pbkdf2.generateRandom();

  const masterKey = await session.decryptMasterKey(sessionToken);
  const encryptionKey = await pbkdf2.PBKDF2KeyGen(masterKey, passSalt);


  const encryptedPass = await aesgcm.encryptString(
    password,
    encryptionKey,
    passIv
  );
  const encryptedUser = await aesgcm.encryptString(
    username,
    encryptionKey,
    nameIv
  );

  const storableUser = arrayBufferToBase64(encryptedUser);
  const storablePass = arrayBufferToBase64(encryptedPass);
  const credentialToken = new CredentialToken(
    passSalt,
    nameIv,
    passIv,
    storableUser,
    storablePass,
    url
  );
  const urlList = await loadLocal(sessionToken.userId);
  const index = urlList.findIndex((item) => Object.values(item).includes(url));
  urlList[index] = credentialToken;
  await saveLocally(sessionToken.userId, urlList);

  return true;
}
