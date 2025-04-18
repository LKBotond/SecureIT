import {
  HashIt,
  PBKDF2KeyGen,
  CreateSession,
  GenerateRandom,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  EnceryptString,
  DecryptString,
} from "../Encrypt/Encrypt.js";
import {
  StoreLocally,
  GetLocal,
  CollectFormData,
  VerifyIntegrity,
} from "../Helpers/Helpers.js";
document.addEventListener("DOMContentLoaded", async function () {
  document
    .getElementById("Login")
    .addEventListener("click", async function (event) {
      event.preventDefault();
      let PreliminaryData = CollectFormData();
      let Integrity = VerifyIntegrity(PreliminaryData);
      if (!Integrity) {
        console.log("Form data is not valid");
        alert("To authenticate you need both a username and a password");
        return;
      }
      await HandleLogin(PreliminaryData);
    });
  document
    .getElementById("Register")
    .addEventListener("click", async function (event) {
      event.preventDefault();
      let PreliminaryData = CollectFormData();
      let Integrity = VerifyIntegrity(PreliminaryData);
      if (!Integrity) {
        console.log("Form data is not valid");
        alert("To authenticate you need both a username and a password");
        return
      }
      await HandleRegister(PreliminaryData);
    });
});

//Register
/*
This function when called registers a new user
*/
async function HandleRegister(PreliminaryData) {

  console.log("Generating necesary random values");
  const MasterSalt = await GenerateRandom(16);
  const PasswordIV = await GenerateRandom(16);
  const UserID = await GenerateRandom(16);
  const EncryptionSalt = await GenerateRandom(16);
  console.log("Got necessary random values");

  console.log("Hashing Username");
  const Uhash = await HashIt(PreliminaryData.Username, null);
  console.log("Username Hashed");

  console.log("generating Master Key with PBKDF2");
  const MasterKeyBase = await HashIt(PreliminaryData.Password, MasterSalt);
  console.log("Master Key Generated");

  console.log("Generating Encryption key with PBKDF2");
  const EncryptionKey = await PBKDF2KeyGen(
    PreliminaryData.Password,
    EncryptionSalt
  );
  console.log("Encryption Key Generated");

  console.log("Encrypting the Master base with Key with AES-GCM");
  const EncryptedPassword = await EnceryptString(
    MasterKeyBase,
    EncryptionKey,
    PasswordIV
  );
  console.log("Master Key Encrypted");

  console.log("converrting Buffer to a storable format");
  const StorableMasterKey = arrayBufferToBase64(EncryptedPassword);
  console.log("Buffer converted");

  console.log("Setting up User Object");
  let User = {
    Mkey: StorableMasterKey,
    MasterSalt: MasterSalt,
    salt: EncryptionSalt,
    IV: PasswordIV,
    UserId: UserID,
  };
  console.log("User object is setup");

  console.log("Storing User Locally");
  await StoreLocally(Uhash, User);
  console.log("User Saved Locally");

  console.log("Creating Session");
  let session = await CreateSession(Uhash, MasterKeyBase, MasterSalt, UserID);
  console.log("Session Created");

  console.log("Storing Session Locally");
  await StoreLocally("session", session);
  console.log("session is stored Locally");
  window.location.href = "logged.html";
  chrome.runtime.sendMessage({ action: "logged" });
}
//Login
async function HandleLogin(PreliminaryData) {
  console.log("Hashing Username");
  const Uhash = await HashIt(PreliminaryData.Username, null);
  console.log("Username Hashed");

  console.log("Searching for User on Record");
  let UserOnRecord = await GetLocal(Uhash);
  console.log("User on record searched");
  if (UserOnRecord) {
    console.log("User on record found");

    console.log("Generating Decryption Key with PBKDF2");
    const DecryptionKey = await PBKDF2KeyGen(
      PreliminaryData.Password,
      UserOnRecord.salt
    );
    console.log("Decryption Key Generated");

    console.log("Converting Stored Master Key to Buffer");
    const EncryptedPasswordBuffer = base64ToArrayBuffer(UserOnRecord.Mkey);
    console.log("Master Key Converted");

    try {
      console.log("Decrypting stored Master Key");
      const MasterKeyBase = await DecryptString(
        EncryptedPasswordBuffer,
        DecryptionKey,
        UserOnRecord.IV
      );
      console.log("Master Key Decrypted");

      //REHASHING THE MASTER KEY BASE
      console.log("Regenerating Master Key base");
      const CurrentMasterKeyBase = await HashIt(
        PreliminaryData.Password,
        UserOnRecord.MasterSalt
      );
      console.log("Master Key Regenerated");

      console.log("Comparing the Master Keys");
      if (MasterKeyBase == CurrentMasterKeyBase) {
        console.log("Master Key Verified");

        let session = await CreateSession(
          Uhash,
          MasterKeyBase,
          UserOnRecord.MasterSalt,
          UserOnRecord.UserId
        );
        console.log("Session Created");
        await StoreLocally("session", session);
        console.log("session stored Locally");
        confirm("Login Successful");
        window.location.href = "logged.html";
        chrome.runtime.sendMessage({ action: "logged" });
      } else {
        alert("Invalid Username or Password");
      }
    } catch (error) {
      console.error("Decryption failed:", error);
      alert("Invalid Username or Password");
    }
  } else {
    console.log("No such user in database");
    alert("Invalid Username or Password");
  }
}
