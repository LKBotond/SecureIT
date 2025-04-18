//web crypto api
export async function EncryptKey(input, Key, IV) {
  console.log("Encrypting Key");
  const encoder = new TextEncoder();
  const Encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: encoder.encode(IV) },
    Key,
    encoder.encode(input)
  );
  console.log("Key Encrypted");
  return Encrypted;
}

export async function DecryptKey(input, Key, IV) {
  console.log("Decrypting Key");
  const encoder = new TextEncoder();
  const Decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: encoder.encode(IV) },
    Key,
    input
  );
  console.log("Key Decrypted");
  return Decrypted;
}

export async function EnceryptString(input, Key, IV) {
  //make The Input string into an array
  const encoder = new TextEncoder();
  const convertedInput = encoder.encode(input);

  //encrypt it with AES-GCM
  const Encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: encoder.encode(IV) },
    Key,
    convertedInput
  );

  //return the encrypted data
  return Encrypted;
}
export async function DecryptString(input, Key, IV) {
  //make The Input into an array
  console.log("Decrypting String");
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  //Decrypt it with AES-GCM
  const Decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: encoder.encode(IV) },
    Key,
    input
  );

  //return the decrypted data
  return decoder.decode(Decrypted);
}
//PBKDF2 Key generator
export async function PBKDF2KeyGen(Password, Salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(Password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(Salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
}

export async function exportKey(key) {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return exported;
}

export async function importKey(buffer) {
  const key = await window.crypto.subtle.importKey(
    "raw",
    buffer,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
}

export async function HashIt(input, salt) {
  //Make the input into an array
  const encoder = new TextEncoder();
  let data = null;
  if (salt) {
    data = encoder.encode(Splice(input, salt));
  } else {
    data = encoder.encode(input);
  }

  //Hash it with SHA-256
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  //Convert the raw array into a HEx string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export async function Uhash(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

export async function GenerateRandom(length) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function CreateSession(Hash, MasterKeyBase, MasterSalt, UserID) {
  console.log("Creating necesary random values for session");
  let sessionID = await GenerateRandom(16);
  let sessionSalt = await GenerateRandom(16);
  let IV = await GenerateRandom(16);
  console.log("Got necessary random values for session");

  console.log("Generating Session Key with PBKDF2");
  let sessionKey = await PBKDF2KeyGen(sessionID, sessionSalt);
  console.log("Session Key Generated");

  console.log("Encrypting Master Key with Session Key");
  const EncryptedKey = await EnceryptString(MasterKeyBase, sessionKey, IV);
  console.log("Master Key Encrypted");

  console.log(" converting Encrypted Key to a storable format");
  const StorableKey = arrayBufferToBase64(EncryptedKey);
  console.log("Encrypted Key converted");

  console.log("Setting up Session Token");
  let sessionToken = {
    UserHash: Hash,
    UserID: UserID,
    MasterSalt: MasterSalt,
    SessionSalt: sessionSalt,
    Key: StorableKey,
    CurrentIV: IV,
    SessionID: sessionID,
    autolog: true,
  };
  console.log("Session Token is setup");
  return sessionToken;
}

export async function DecryptSession(session) {
  const sessionKey = await PBKDF2KeyGen(session.SessionID, session.SessionSalt);
  const deserializedKey = base64ToArrayBuffer(session.Key);
  const Key = await decrypt(deserializedKey, sessionKey, session.CurrentIV);
  return Key;
}

export async function Validate(Records, CurrentPass) {
  console.log("Validate Function reachec");
  let SusPass = await PBKDF2KeyGen(CurrentPass, Records.salt);
  console.log("SusPass Generated");
  let Dearrayed = base64ToArrayBuffer(Records.Mkey);
  console.log("Dearrayed Key Generated");
  let DecryptedKey = await decrypt(Dearrayed, SusPass, Records.IV);
  console.log("Decrypted Key Generated");
  return DecryptedKey === SusPass;
}

function Splice(input, salt) {
  //Make the input and Salt into arrays
  const encoder = new TextEncoder();
  const InputArray = encoder.encode(input);
  const SaltArray = encoder.encode(salt);

  //set up the total of the new array
  let TotalLength = InputArray.length + SaltArray.length;
  let Spliced = new Uint8Array(TotalLength);

  //Splice the arrays
  let Toggle = true;
  let inputCounter = 0;
  let saltCounter = 0;
  for (let i = 0; i <= TotalLength; i++) {
    if (Toggle) {
      if (inputCounter <= InputArray.length) {
        Spliced[i] = InputArray[inputCounter];
        inputCounter++;
      }
    } else {
      if (saltCounter <= SaltArray.length) {
        Spliced[i] = SaltArray[saltCounter];
        saltCounter++;
      }
    }
    Toggle = !Toggle;
  }
  return Spliced;
}

export function arrayBufferToBase64(buffer) {
  const uint8Array = new Uint8Array(buffer);
  let binaryString = "";
  uint8Array.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });
  return window.btoa(binaryString);
}

export function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64); 
  const length = binaryString.length;
  const arrayBuffer = new ArrayBuffer(length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return arrayBuffer; 
}
