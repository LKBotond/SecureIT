import {
  hashIt,
  PBKDF2KeyGen,
  createSession,
  generateRandom,
  encryptString,
  arrayBufferToBase64,
  validate,
} from "../Encrypt/Encrypt.js";
import {
  storeLocally,
  getLocal,
  collectFormData,
  verifyIntegrity,
  storeSession,
  verboten
} from "../Helpers/Helpers.js";

document.addEventListener("DOMContentLoaded", async function () {
  document
    .getElementById("Login")
    .addEventListener("click", async function (event) {
      event.preventDefault();
      let preliminary_Data = collectFormData();
      let integrity = verifyIntegrity(preliminary_Data);
      if (!integrity) {
        console.log("Form data is not valid");
        alert("To authenticate you need both a username and a password");
        return;
      }
      if (verboten(preliminary_Data)) {
        console.log("Form data is not valid");
        alert("Invalid characters in username or password");
        return;
      }
      await HandleLogin(preliminary_Data);
    });
  document
    .getElementById("Register")
    .addEventListener("click", async function (event) {
      event.preventDefault();
      let preliminary_Data = collectFormData();
      let integrity = verifyIntegrity(preliminary_Data);
      if (!integrity) {
        console.log("Form data is not valid");
        alert("To authenticate you need both a username and a password");
        return;
      }
      if (verboten(preliminary_Data)) {
        console.log("Form data is not valid");
        alert("Invalid characters in username or password");
        return;
      }
      await HandleRegister(preliminary_Data);
    });
});

//Register
//This function when called registers a new user
async function HandleRegister(preliminary_Data) {
  const master_Salt = await generateRandom(16);
  const password_IV = await generateRandom(16);
  const user_ID = await generateRandom(16);
  const encryption_Salt = await generateRandom(16);
  console.log("Got necessary random values");

  const Uhash = await hashIt(preliminary_Data.Username, null);
  console.log("Username Hashed");

  const master_Key_Base = await hashIt(preliminary_Data.Password, master_Salt);
  console.log("Master Key Generated");

  const EncryptionKey = await PBKDF2KeyGen(
    preliminary_Data.Password,
    encryption_Salt
  );
  console.log("Encryption Key Generated");

  const EncryptedPassword = await encryptString(
    master_Key_Base,
    EncryptionKey,
    password_IV
  );
  console.log("Master Key Encrypted");

  const storable_Master_Key = arrayBufferToBase64(EncryptedPassword);
  console.log("Buffer converted");

  let User = {
    Mkey: storable_Master_Key,
    MasterSalt: master_Salt,
    salt: encryption_Salt,
    IV: password_IV,
    UserId: user_ID,
  };
  console.log("User object is set up");

  await storeLocally(Uhash, User);
  console.log("User Saved Locally");

  const session = await createSession(
    Uhash,
    master_Key_Base,
    master_Salt,
    user_ID
  );
  console.log("Session Created");

  await storeSession("session", session);
  console.log("session is stored Locally");
  window.location.href = "logged.html";
  chrome.runtime.sendMessage({ action: "logged" });
}

//Login
async function HandleLogin(preliminary_Data) {
  const Uhash = await hashIt(preliminary_Data.Username, null);
  console.log("Username Hashed");

  const user_On_Record = await getLocal(Uhash);
  console.log("Searching for user in local storage");
  if (!user_On_Record) {
    console.log("No such user in the database");
    alert("Invalid Username or Password");
    return;
  }

  console.log("User on record found");

  if (!validate(user_On_Record, preliminary_Data.Password)) {
    console.log("Password is not valid");
    alert("Invalid Username or Password");
    return;
  }

  console.log("Master Key Verified");
  const master_Key_Base = await hashIt(preliminary_Data.Password, user_On_Record.MasterSalt);

  const session = await createSession(
    Uhash,
    master_Key_Base,
    user_On_Record.MasterSalt,
    user_On_Record.UserId
  );
  console.log("Session Created");
  await storeSession("session", session);
  console.log("session stored Locally");

  window.location.href = "logged.html";
  chrome.runtime.sendMessage({ action: "logged" });
}
