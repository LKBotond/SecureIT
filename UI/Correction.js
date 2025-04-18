import { encrypt,PBKDF2KeyGen, DecryptSession, GenerateRandom } from "../Encrypt/Encrypt.js";
import { StoreLocally,GetLocal } from "../Helpers/Helpers.js";
let collected = {
  Username: null,
  Password: null,
  IV: null,
};

document.getElementById("submit").addEventListener("click", function (event) {
  event.preventDefault();
  if (confirm("This will update your stored data, are you sure?")) {
    let session = JSON.parse(GetLocal("session"));
    session = DecryptSession(session);
    let Username = document.getElementById("username").value;
    let Password = document.getElementById("password").value;
    let IV = GenerateRandom(16);
    Password = encrypt(Password, session.Key, IV);
    let URL = document.getElementById("URL").value;
    let URL_List = JSON.parse(localStorage.getItem(session.UserHash));
    if (URL_List.includes(URL)) {
      collected.Username = Username;
      collected.Password = Password;
      collected.IV = IV;
      URL_List[URL] = collected;
    }
    StoreLocally(session.UserHash, JSON.stringify(URL_List));
    alert("Data Updated");
  }
});

document.getElementById("back").addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "logged.html";
});

//has to be revised with PBKDF2KeyGen