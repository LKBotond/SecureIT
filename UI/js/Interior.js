import { getAutolog } from "../../logic/Autolog.js";
import { sendMessage } from "../../storage/Messages.js";
await initializeAutolog();

document.getElementById("logout").addEventListener("click", async (event) => {
  console.log("Button clicked:", event.target);
  handleLogout();
});

document.getElementById("delete").addEventListener("click", async (event) => {
  console.log("Button clicked:", event.target);
  await handleUserDeletion();
});

document.getElementById("autolog").addEventListener("click", async (event) => {
  console.log("Button clicked:", event.target);
  await handleAutoLog();
});

document.getElementById("update").addEventListener("click", async (event) => {
  console.log("Button clicked:", event.target);
  window.location.href = "../HTML/Correction.html";
});

async function handleLogout() {
  const response = await sendMessage({ action: "logout" });
  if (response.success) {
    chrome.action.setPopup({ popup: "UI/HTML/Index.html" });
    window.location.href = "../HTML/Index.html";
  } else {
    alert("Logout Failed");
  }
}

async function handleUserDeletion() {
  const susPass = prompt("Enter your password to confirm your decision:");
  const response = await sendMessage({ action: "delete", pass: susPass });
  if (response.success) {
    alert("Your account and passwords have been ppermanently deleted");
  } else {
    alert("Invalid password, You've been logged out");
  }
  chrome.action.setPopup({ popup: "UI/HTML/Index.html" });
  window.location.href = "../HTML/Index.html";
}
async function handleAutoLog() {
  const response = await sendMessage({ action: "switch" });
  if (response.status == true) {
    document.getElementById("AutologTXT").textContent = "Enabled";
  } else {
    document.getElementById("AutologTXT").textContent = "Disabled";
  }
}

async function initializeAutolog() {
  const status = await getAutolog();
  if (status == true) {
    document.getElementById("AutologTXT").textContent = "Enabled";
  } else {
    document.getElementById("AutologTXT").textContent = "Disabled";
  }
}
