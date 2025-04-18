const NameTypes = ["text", "email", "tel"];
const PassType = "password";

async function EnceryptString(input, Key, IV) {
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
async function DecryptString(input, Key, IV) {
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

async function GenerateRandom(length) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function PBKDF2KeyGen(Password, Salt) {
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
function arrayBufferToBase64(buffer) {
  const uint8Array = new Uint8Array(buffer);
  let binaryString = "";
  uint8Array.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });
  return window.btoa(binaryString);
}
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64); // Decode the base64 string to binary string
  const length = binaryString.length;
  const arrayBuffer = new ArrayBuffer(length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return arrayBuffer; // Return as ArrayBuffer
}

async function GetLocal(Key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(Key, function (result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[Key]);
      }
    });
  });
}

function CheckForName(input) {
  if (!NameTypes.includes(input.type)) {
    return false;
  }
  //check for username in the name, id, placeholder and class of the input
  if (
    /user/.test((input.getAttribute("name") || "").toLowerCase()) ||
    /user/.test((input.getAttribute("id") || "").toLowerCase()) ||
    /user/.test((input.getAttribute("placeholder") || "").toLowerCase()) ||
    /user/.test((input.getAttribute("class") || "").toLowerCase())
  ) {
    return input;
  }
  if (
    /mail/.test((input.getAttribute("name") || "").toLowerCase()) ||
    /mail/.test((input.getAttribute("id") || "").toLowerCase()) ||
    /mail/.test((input.getAttribute("placeholder") || "").toLowerCase()) ||
    /mail/.test((input.getAttribute("class") || "").toLowerCase())
  ) {
    return input;
  }
  if (
    /phone/.test((input.getAttribute("name") || "").toLowerCase()) ||
    /phone/.test((input.getAttribute("id") || "").toLowerCase()) ||
    /phone/.test((input.getAttribute("placeholder") || "").toLowerCase()) ||
    /phone/.test((input.getAttribute("class") || "").toLowerCase())
  ) {
    return input;
  }
  return false;
}
function CheckForPass(input) {
  if (!input.type === PassType) {
    return false;
  }
  if (
    /pass/.test((input.getAttribute("name") || "").toLowerCase()) ||
    /pass/.test((input.getAttribute("id") || "").toLowerCase()) ||
    /pass/.test((input.getAttribute("placeholder") || "").toLowerCase()) ||
    /pass/.test((input.getAttribute("class") || "").toLowerCase())
  ) {
    return input;
  }
  return false;
}

function getLoginForm() {
  const Forms = document.querySelectorAll("form");
  console.log("found this", Forms);
  for (let Form of Forms) {
    console.log("we are here", Form);
    const inputs = Form.querySelectorAll("input");
    console.log("found these inputs", inputs);
    let NameFound = false;
    let PassFound = false;
    inputs.forEach((input) => {
      console.log("We are at this input", input);
      const IsName = CheckForName(input);
      const IsPass = CheckForPass(input);
      console.log("Name", IsName);
      console.log("Pass", IsPass);
      if (IsName) {
        console.log("name Found");
        NameFound = true;
      }
      if (IsPass) {
        console.log("Pass Found");
        PassFound = true;
      }
    });
    if (NameFound && PassFound) {
      return Form;
    }
  }
  return null;
}
function GetLoginButton(form) {
  console.log("getting login button");
  let buttons = form.querySelectorAll("button");
  for (let button of buttons) {
    console.log("found a button", button);
    if (button.type == "submit") {
      if (
        /log/.test((button.getAttribute("name") || "").toLowerCase()) ||
        /log/.test((button.getAttribute("id") || "").toLowerCase()) ||
        /log/.test((button.getAttribute("class") || "").toLowerCase()) ||
        /log/.test(button.textContent.toLowerCase())
      ) {
        console.log("found THE button", button);
        return button;
      }
    }
  }
  return null;
}

function GetLoginData(form) {
  let credentials = {
    Url: window.location.href,
    IV: null,
    LocalSalt: null,
    username: null,
    password: null,
  };

  //get input data
  const inputs = form.querySelectorAll("input");
  let NameFound = false;
  let PassFound = false;
  inputs.forEach((input) => {
    let IsName = CheckForName(input);
    let IsPass = CheckForPass(input);
    if (IsName) {
      credentials.username = input.value;
      NameFound = true;
    }
    if (IsPass) {
      credentials.password = input.value;
      PassFound = true;
    }
  });
  if (NameFound && PassFound) {
    console.log("credentials found and saved");
    return credentials;
  }

  return null;
}

async function EncryptCredentials(credentials, Session) {
  const EncryptionKey = await PBKDF2KeyGen(
    Session.SessionID,
    Session.SessionSalt
  );

  console.log("Encryption Key generated", EncryptionKey);

  const MasterKeyBase = base64ToArrayBuffer(Session.Key);

  console.log("Master Key base64 converted", MasterKeyBase);

  const MasterKeyString = await DecryptString(
    MasterKeyBase,
    EncryptionKey,
    Session.CurrentIV
  );
  console.log("Master Key decrypted", MasterKeyString);

  let LocalSalt = await GenerateRandom(16);
  console.log("Web Salt generated", LocalSalt);
  const MasterKey = await PBKDF2KeyGen(MasterKeyString, LocalSalt);

  console.log("Master Key decrypted", MasterKey);

  const IV = await GenerateRandom(16);
  const EncryptedPassword = await EnceryptString(
    credentials.password,
    MasterKey,
    IV
  );

  console.log("Encrypted Password", EncryptedPassword);

  const EncryptedUsername = await EnceryptString(
    credentials.username,
    MasterKey,
    IV
  );

  console.log("Encrypted Username", EncryptedUsername);
  credentials.IV = IV;
  credentials.LocalSalt = LocalSalt;
  credentials.username = arrayBufferToBase64(EncryptedUsername);
  credentials.password = arrayBufferToBase64(EncryptedPassword);
  return credentials;
}

async function DecryptCredentials(credentials, session) {
  const EncryptionKey = await PBKDF2KeyGen(
    session.SessionID,
    session.SessionSalt
  );
  console.log("Encryption Key generated", EncryptionKey);

  const MasterKeyBase = base64ToArrayBuffer(session.Key);
  console.log("Master Key base64 converted", MasterKeyBase);

  const MasterKeyString = await DecryptString(
    MasterKeyBase,
    EncryptionKey,
    session.CurrentIV
  );

  const MasterKey = await PBKDF2KeyGen(MasterKeyString, credentials.LocalSalt);
  console.log("Master Key decrypted", MasterKey);
  const IV = credentials.IV;
  const DecryptedPassword = await DecryptString(
    base64ToArrayBuffer(credentials.password),
    MasterKey,
    IV
  );
  const DecryptedUsername = await DecryptString(
    base64ToArrayBuffer(credentials.username),
    MasterKey,
    IV
  );

  credentials.password = DecryptedPassword;
  credentials.username = DecryptedUsername;
  return credentials;
}

function Infill(credentials) {
  console.log("Infill function fired", credentials);
  const Form = getLoginForm();
  const inputs = Form.querySelectorAll("input");
  inputs.forEach((input) => {
    if (CheckForName(input)) {
      input.value = credentials.username;
    }
    if (CheckForPass(input)) {
      input.value = credentials.password;
    }
  });
  Form.submit();
}

//main
chrome.runtime.onConnect.addListener(function (port) {
  port.postMessage({ message: "connected", url: window.location.href });
  port.onMessage.addListener(async function (request) {
    console.log("Port is connected to background script", request);
    if (request.message == "scrape") {
      console.log("scraping for credentials");

      const Form = getLoginForm();

      const LoginButton = GetLoginButton(Form);
      LoginButton.addEventListener("click", async function (event) {
        event.preventDefault();
        const credentials = GetLoginData(Form);
        if (credentials) {
          const Session = await GetLocal("session");
          const EncryptedCredentials = await EncryptCredentials(
            credentials,
            Session
          );
          port.postMessage({
            message: "scraped",
            payload: EncryptedCredentials,
          });
          console.log("scraped credentials", EncryptedCredentials);
          return;
        }
      });
    } else if (request.message == "infill") {
      console.log("Infill function fired", request.payload);
      const Session = await GetLocal("session");
      console.log("Session", Session);
      const credentials = await DecryptCredentials(request.payload, Session);
      Infill(credentials);
      port.postMessage({ message: "infilled" });
      return;
    }
  });
});

//IT IS ALLIVE and WORKING
