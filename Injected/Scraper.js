//necesary constants
console.log("Scraper.js loaded");
const name_Types = ["text", "email", "tel"];
const pass_Type = "password";

//copied import functions
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
async function sessionDeriveMasterKey(session, salt) {
  if (!salt) {
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

async function getLocal(Key) {
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

async function encryptString(input, Key, IV) {
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

async function decryptString(input, Key, IV) {
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

async function generateRandom(length) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
  const binaryString = window.atob(base64);
  const length = binaryString.length;
  const arrayBuffer = new ArrayBuffer(length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return arrayBuffer;
}

//local functions
function checkForName(input) {
  if (!name_Types.includes(input.type)) {
    return false;
  }
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
  if (
    /ident/.test((input.getAttribute("name") || "").toLowerCase()) ||
    /ident/.test((input.getAttribute("id") || "").toLowerCase()) ||
    /ident/.test((input.getAttribute("placeholder") || "").toLowerCase()) ||
    /ident/.test((input.getAttribute("class") || "").toLowerCase())
  ) {
    return true;
  }
  return false;
}
function checkForPass(input) {
  if (input.type !== pass_Type) {
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
  console.log("searching for forms");
  const forms = document.querySelectorAll("form");

  for (let form of forms) {
    const inputs = form.querySelectorAll("input");
    let name_Found = false;
    let pass_Found = false;

    inputs.forEach((input) => {
      const is_Name = checkForName(input);
      const is_Pass = checkForPass(input);

      if (is_Name) {
        console.log("name Found");
        name_Found = true;
      }
      if (is_Pass) {
        console.log("Pass Found");
        pass_Found = true;
      }
    });
    if (name_Found && pass_Found) {
      console.log("Found form with name and pass inputs");
      return form;
    }
  }
  return null;
}
function getLoginButton(form) {
  console.log("getting login button");
  let buttons = form.querySelectorAll("button");
  for (let button of buttons) {
    if (button.type == "submit") {
      if (
        /log/.test((button.getAttribute("name") || "").toLowerCase()) ||
        /log/.test((button.getAttribute("id") || "").toLowerCase()) ||
        /log/.test((button.getAttribute("class") || "").toLowerCase()) ||
        /log/.test(button.textContent.toLowerCase())
      ) {
        console.log("found THE button");
        return button;
      } else if (
        /in/.test((button.getAttribute("name") || "").toLowerCase()) ||
        /in/.test((button.getAttribute("id") || "").toLowerCase()) ||
        /in/.test((button.getAttribute("class") || "").toLowerCase()) ||
        /in/.test(button.textContent.toLowerCase())
      ) {
        console.log("found THE button");
        return button;
      } else if (
        /sign/.test((button.getAttribute("name") || "").toLowerCase()) ||
        /sign/.test((button.getAttribute("id") || "").toLowerCase()) ||
        /sign/.test((button.getAttribute("class") || "").toLowerCase()) ||
        /sign/.test(button.textContent.toLowerCase())
      ) {
        console.log("found THE button");
        return button;
      } else if (
        /next/.test((button.getAttribute("name") || "").toLowerCase()) ||
        /next/.test((button.getAttribute("id") || "").toLowerCase()) ||
        /next/.test((button.getAttribute("class") || "").toLowerCase()) ||
        /next/.test(button.textContent.toLowerCase())
      ) {
        console.log("found THE button");
        return button;
      }
    }
  }
  return null;
}

function getLoginData(form) {
  let credentials = {
    URL: null,
    IV: null,
    localSalt: null,
    username: null,
    password: null,
  };

  //get input data
  const inputs = form.querySelectorAll("input");
  let name_Found = false;
  let pass_Found = false;
  inputs.forEach((input) => {
    let IsName = checkForName(input);
    let IsPass = checkForPass(input);
    if (IsName) {
      credentials.username = input.value;
      name_Found = true;
    }
    if (IsPass) {
      credentials.password = input.value;
      pass_Found = true;
    }
  });
  if (name_Found && pass_Found) {
    console.log("credentials found and saved");
    return credentials;
  }

  return null;
}

async function encryptCredentials(credentials, session) {
  let local_Salt = await generateRandom(16);

  const master_Key = await sessionDeriveMasterKey(session, local_Salt);
  console.log("Master Key Generated");

  const IV = await generateRandom(16);
  const encrypted_Password = await encryptString(
    credentials.password,
    master_Key,
    IV
  );

  console.log("Encrypted Password");

  const encrypted_Username = await encryptString(
    credentials.username,
    master_Key,
    IV
  );

  console.log("Encrypted Username");
  credentials.IV = IV;
  credentials.localSalt = local_Salt;
  credentials.username = arrayBufferToBase64(encrypted_Username);
  credentials.password = arrayBufferToBase64(encrypted_Password);
  return credentials;
}

async function decryptCredentials(credentials, session) {
  const master_Key = await sessionDeriveMasterKey(
    session,
    credentials.localSalt
  );
  console.log("Master Key derived");
  const IV = credentials.IV;
  const DecryptedPassword = await decryptString(
    base64ToArrayBuffer(credentials.password),
    master_Key,
    IV
  );
  const DecryptedUsername = await decryptString(
    base64ToArrayBuffer(credentials.username),
    master_Key,
    IV
  );

  credentials.password = DecryptedPassword;
  credentials.username = DecryptedUsername;
  return credentials;
}

function infill(credentials, login_Button) {
  console.log("Filling out form");
  const form = getLoginForm();
  if (!form) {
    console.log("No form found, aborting infill");
    return;
  }
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    if (checkForName(input)) {
      input.value = credentials.username;
    }
    if (checkForPass(input)) {
      input.value = credentials.password;
    }
  });
  //login_Button.click();
}
async function intercept(event, login_Form, login_Button, session, port) {
  event.preventDefault();
  const credentials = getLoginData(login_Form);
  //potential Issue here if credentials are incomplete and the user clicks by accident
  if (credentials) {
    const encrypted_Credentials = await encryptCredentials(
      credentials,
      session
    );
    port.postMessage({
      message: "scraped",
      payload: encrypted_Credentials,
    });
    console.log("scraped credentials");
    login_Button.click();
  }
}

//main
async function main() {
  const login_Form = getLoginForm();
  if (!login_Form) {
    console.log("No form found, aborting scrape");
    return;
  }
  const login_Button = getLoginButton(login_Form);
  if (!login_Button) {
    console.log("No form found, aborting scrape");
    return;
  }

  chrome.runtime.onConnect.addListener(async function (port) {
    if (port.name != "backchanel") {
      console.log("Port is foreign, ignoring");
      port.disconnect();
      return;
    }
    port.onMessage.addListener(async function (request) {
      console.log("Port is connected to background script");
      const session = request.session;
      if (request.message == "scrape") {
        console.log("scraping for credentials");
        login_Button.addEventListener(
          "click",
          (event) => intercept(event, login_Form, login_Button, session, port),
          {
            once: true,
          }
        );
      } else if (request.message == "infill") {
        console.log("Infill function fired");
        const credentials = await decryptCredentials(request.payload, session);
        port.postMessage({ message: "infilled" });
        infill(credentials, login_Button);
        return;
      }
    });
  });
}

(async () => {
  await main();
})();
