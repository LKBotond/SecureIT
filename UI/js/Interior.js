import { logout } from "../../logic/Logout";
import { sendMessage } from "../../storage/Messages";

document.getElementById("Logout").addEventListener("click", async () => {
  const response = await sendMessage({ action: "logout" });
});

document.getElementById("Delete").addEventListener("click", async () => {
  await handleUserDeletion();
});

document.getElementById("Autolog").addEventListener("click", async () => {});

document.getElementById("Update").addEventListener("click", async () => {});

async function handleUserDeletion() {
  const susPass = prompt("Enter your password to confirm your decision:");
  const response = await sendMessage({ action: "delete", pass: susPass });
  if (response.success) {
    alert("Your account and passwords have been ppermanently deleted");
  } else {
    alert("Invalid password, You've been logged out");
  }
  chrome.action.setPopup({ popup: "UI/HTML/Login.html" });
  window.location.href = "../HTML/Login.html";
}
