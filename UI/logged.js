import { validate } from "../Encrypt/Encrypt.js";
import { getLocal, storeLocally,getSession,storeSession, DELETE } from "../Helpers/Helpers.js";

function Modify(id, value) {
  document.getElementById(id).textContent = value;
}

async function setAutolog(){
  let session = await getSession("session");
  let toggle = session.autolog;
  if (toggle) {
    Modify("AutologTXT", "Enabled");
  } else {
    Modify("AutologTXT", "Disabled");
  }
}
async function toggleAutolog() {
  let session = await getSession("session");
  let toggle = session.autolog;
  toggle = !toggle;
  if (toggle) {
    Modify("AutologTXT", "Enabled");
  } else {
    Modify("AutologTXT", "Disabled");
  }
  session.autolog = toggle;
  await storeSession("session", session);
}

async function Logout() {
  console.log("Pressed Logout");
  await DELETE("session");
  chrome.runtime.sendMessage({ action: "Out" });
  window.location.href = "index.html";
}

async function deleteUser() {
  let session = await getSession("session");
  let User = await getLocal(session.UserHash);
  console.log("User is", User);
  let SusPass = prompt("Type in your password to verify your identity");
  let passCorrect = await validate(User, SusPass);
  if (!passCorrect) {
    alert("Invalid Password");
    return;
  }
  if (confirm("Are you sure? THIS WILL DELETE ALL YOUR STORED PASSWORDS")) {
    await DELETE(session.UserID);
    await DELETE(session.UserHash);
    await DELETE("session");
    alert("All stored Data has been deleted");
    window.location.href = "index.html";
  }
}

document.addEventListener("DOMContentLoaded", async function () {
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
      await deleteUser();
    });

  //Set Autolog
  await setAutolog();

  //Toggle Autolog
  document
    .getElementById("Autolog")
    .addEventListener("click", async function (event) {
      await toggleAutolog();
    });

  //direct Updates
  document.getElementById("Update").addEventListener("click", function (event) {
    console.log("Pressed Update");
    event.preventDefault();
    window.location.href = "Correction.html";
  });
});