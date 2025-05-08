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


} from "../Helpers/Helpers.js";

document
  .getElementById("submit")
  .addEventListener("click", async function (event) {
    event.preventDefault();
    console.log("Submit button clicked");

    if (!confirm("This will update your stored data, are you sure?")) {
      console.log("User cancelled the update");
      return;
    }
    const session = await getSession("session");
    let URL_List = await getLocal(session.UserID);
    let URL = document.getElementById("URL").value;
    let credentials = URL_List.find((item) => Object.values(item).includes(URL));
    if (!credentials) {
      alert("veird way to  add a password but ok");
    }
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    if (username == "" || password == "") {
      alert("Please fill in all fields");
      return;
    }
    let IV = await generateRandom(16);
    let local_salt = await generateRandom(16);
    
    const master_Key = await sessionDeriveMasterKey(session, local_salt);
    const encrypted_Username = await encryptString(username, master_Key, IV);
    const encrypted_Password = await encryptString(password, master_Key, IV);

    //updating data
    credentials.IV = IV;
    credentials.localSalt = local_salt;
    credentials.username = arrayBufferToBase64(encrypted_Username);
    credentials.password = arrayBufferToBase64(encrypted_Password);
    const index = URL_List.findIndex((item) => Object.values(item).includes(URL));
    URL_List[index] = credentials;
    console.log("Data updated");
    await storeLocally(session.UserID, URL_List);
    alert("Data Updated");
    window.location.href = "logged.html";
    return;
  });

document.getElementById("back").addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "logged.html";
});
