//web crypto api
export async function encryptString(input, Key, IV) {
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
export async function decryptString(input, Key, IV) {
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

export async function hashIt(input, salt = null) {
  //Make the input into an array
  const encoder = new TextEncoder();
  let data = null;
  if (salt) {
    data = encoder.encode(interSplice(input, salt));
  } else {
    data = encoder.encode(input);
  }

  //Hash it with SHA-256
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export async function generateRandom(length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSession(userHash, masterKeyBase, masterSalt, UserID) {
  console.log("Creating necesary random values for session");
  let sessionID = await generateRandom(16);
  let sessionSalt = await generateRandom(16);
  let IV = await generateRandom(16);
  console.log("Got necessary random values for session");

  console.log("Generating Session Key with PBKDF2");
  let sessionKey = await PBKDF2KeyGen(sessionID, sessionSalt);
  console.log("Session Key Generated");

  console.log("Encrypting Master Key with Session Key");
  const EncryptedKey = await encryptString(masterKeyBase, sessionKey, IV);
  console.log("Master Key Encrypted");

  console.log(" converting Encrypted Key to a storable format");
  const StorableKey = arrayBufferToBase64(EncryptedKey);
  console.log("Encrypted Key converted");

  console.log("Setting up Session Token");
  let sessionToken = {
    UserHash: userHash,
    UserID: UserID,
    MasterSalt: masterSalt,
    SessionSalt: sessionSalt,
    Key: StorableKey,
    CurrentIV: IV,
    SessionID: sessionID,
    autolog: true,
  };
  console.log("Session Token is setup");
  return sessionToken;
}

export async function sessionDeriveMasterKey(session, salt) {

  if(!salt){
    salt = session.MasterSalt;
  }
  const decryption_Key = await PBKDF2KeyGen(
    session.SessionID,
    session.SessionSalt
  );
  const master_Key_Array = base64ToArrayBuffer(session.Key);
  const master_Key_Base = await decryptString(
    master_Key_Array,
    decryption_Key,
    session.CurrentIV
  );
  const master_Key = PBKDF2KeyGen(master_Key_Base, salt);

  return master_Key;
}

export async function validate(records, current_Pass_string) {
  console.log("Validate Function reachec");
  let SusPass = await PBKDF2KeyGen(current_Pass_string, records.salt);
  console.log("SusPass Generated");
  const encrypted_Buffer = base64ToArrayBuffer(records.Mkey);
  console.log("Encrypted_Buffer generated");

  try {
    const decrypted_Key = await decryptString(
      encrypted_Buffer,
      SusPass,
      records.IV
    );
    console.log("Decrypted Key Generated");

    const master_Key = await hashIt(current_Pass_string, records.MasterSalt);

    if (decrypted_Key === master_Key) {
      console.log("Password is Valid");
      return true;
    }

    return false;

  } catch (error) {
    console.log("Error Decrypting Key: ", error);
    return false;
  }
}

function interSplice(input, salt) {
  //Make the input and Salt into arrays
  const encoder = new TextEncoder();
  const InputArray = encoder.encode(input);
  const SaltArray = encoder.encode(salt);

  //set up the total length of the new array
  let TotalLength = InputArray.length + SaltArray.length;
  let Spliced = new Uint8Array(TotalLength);

  //Inter splice the arrays
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
