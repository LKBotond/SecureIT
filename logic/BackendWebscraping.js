import AESGCM from "../security/Encryption.js";
import KDF from "../security/KDF.js";
import Session from "../session/Session.js";
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from "../storage/DataConvertors.js";
import { loadLocal, saveLocally } from "../storage/DataStorage.js";

import CredentialToken from "../tokens/CredentialToken.js";

//Global Constants
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const pbkdf2 = new KDF(encoder);
const aesgcm = new AESGCM(encoder, decoder);
const session = new Session(pbkdf2, aesgcm);

export function checkForUrl(url, urlList) {
  const target = urlList.find((potential) => potential.url === url);
  if (target) {
    return target;
  }
  return null;
}

export function requestScraping(port) {
  console.log("scraping for credentials");
  console.log("port:", port);
  port.postMessage({ action: "scrape" });
}

export async function catchCredentials(response, sessionToken, url) {
  const userName = response.userName;
  const password = response.password;
  const nameIv = await pbkdf2.generateRandom(16);
  const passIv = await pbkdf2.generateRandom(16);
  const passSalt = await pbkdf2.generateRandom(16);

  const masterKey = await session.decryptMasterKey(sessionToken);
  const encryptionKey = await pbkdf2.PBKDF2KeyGen(masterKey, passSalt);

  const encryptedUser = await aesgcm.encryptString(
    userName,
    encryptionKey,
    nameIv
  );
  const encryptedPass = await aesgcm.encryptString(
    password,
    encryptionKey,
    passIv
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
  console.log(credentialToken);
  return credentialToken;
}
export async function updateAndSaveRecords(urlList, userId, credentialToken) {
  urlList.push(credentialToken);
  await saveLocally(userId, urlList);
}
export async function infill(port, sessionToken, credentialToken) {
  const masterKey = await session.decryptMasterKey(sessionToken);
  const encryptionKey = await pbkdf2.PBKDF2KeyGen(
    masterKey,
    credentialToken.passSalt
  );
  const userBuffer = base64ToArrayBuffer(credentialToken.encryptedUserName);
  const passBuffer = base64ToArrayBuffer(credentialToken.encryptedPassword);
  const decryptedUser = await aesgcm.decryptString(
    userBuffer,
    encryptionKey,
    credentialToken.nameIV
  );
  const decryptedPass = await aesgcm.decryptString(
    passBuffer,
    encryptionKey,
    credentialToken.passIV
  );
  const credentials = { userName: decryptedUser, password: decryptedPass };
  const autologStatus = await loadLocal(sessionToken.userId + "autolog");
  port.postMessage({
    action: "infill",
    credentials: credentials,
    autolog: autologStatus,
  });
}
