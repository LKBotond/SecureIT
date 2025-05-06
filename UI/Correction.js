import {
  encryptString,
  generateRandom,
  arrayBufferToBase64,
  sessionDeriveMasterKey,
} from "../Encrypt/Encrypt.js";
import {
  storeLocally,
  getLocal,
  getSession,
  verifyIntegrity,
  verboten

} from "../Helpers/Helpers.js";

document
  .getElementById("submit")
  .addEventListener("click", async function (event) {
    event.preventDefault();

    if (!confirm("This will update your stored data, are you sure?")) {
      console.log("User cancelled the update");
      return;
    }
    const session = getSession("session");
    let URL_List = await getLocal(session.UserID);
    let URL = document.getElementById("URL").value;
    const credentials = URL_List.find((item) => item[URL]);
    if (!credentials) {
      alert("URL not found in the list");
      return;
    }

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let IV = await generateRandom(16);
    let local_salt = await generateRandom(16);
    
    const master_Key = await sessionDeriveMasterKey(session, local_salt);
    const encrypted_Username = await encryptString(username, master_Key, IV);
    const encrypted_Password = await encryptString(password, master_Key, IV);

    //updating data
    credentials.IV = IV;
    credentials.localSalt = salt;
    credentials.username = arrayBufferToBase64(encrypted_Username);
    credentials.password = arrayBufferToBase64(encrypted_Password);
    URL_List[URL] = credentials;
    console.log("Data updated");
    storeLocally(session.UserHash, JSON.stringify(URL_List));
    alert("Data Updated");
    window.location.href = "logged.html";
    return;
  });

document.getElementById("back").addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "logged.html";
});
