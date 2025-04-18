import {
  Validate,
} from "../Encrypt/Encrypt.js";
import { GetLocal, StoreLocally, DELETE } from "../Helpers/Helpers.js";
document.addEventListener("DOMContentLoaded", function () {
  //Logout
  document
    .getElementById("Logout")
    .addEventListener("click", async function (event) {
      event.preventDefault();
      await Logout();
    });

  //delete
  document
    .getElementById("Delete")
    .addEventListener("click", async function (event) {
      console.log("Pressed DELETE");
      event.preventDefault();
      await DeleteUser();
    });

  //Toggle Autolog
  document
    .getElementById("Autolog")
    .addEventListener("click", async function (event) {
      event.preventDefault();
      await ToggleAutolog();
    });

  //direct Updates
  document.getElementById("Update").addEventListener("click", function (event) {
    console.log("Pressed Update");
    event.preventDefault();
    window.location.href = "Correction.html";
  });
});




function Modify(id, value) {
  document.getElementById(id).textContent = value;
}

async function ToggleAutolog() {
  let session = await GetLocal("session");
  let toggle = session.autolog;
  toggle = !toggle;
  if (toggle) {
    Modify("AutologTXT", "Enabled");
  } else {
    Modify("AutologTXT", "Disabled");
  }
  session.autolog = toggle;
  await StoreLocally("session", session);
}

async function Logout() {
  console.log("Pressed Logout");
  await DELETE("session");
  chrome.runtime.sendMessage({ action: "Out" });
  window.location.href = "index.html";
}

async function DeleteUser() {
  let session = await GetLocal("session");
  let User = GetLocal(session.UserHash);
  let SusPass = prompt("Type in your password to verify your identity");
  if (Validate(User, SusPass)) {
    if (confirm("Are you sure? THIS WILL DELETE ALL YOUR STORED PASSWORDS")) {
      await DELETE(session.UserID);
      await DELETE(session.UserHash);
      await DELETE("session");
      alert("All stored Data has been deleted");
      window.location.href = "index.html";
    }
  } else {
    alert("Invalid Password");
  }
}

