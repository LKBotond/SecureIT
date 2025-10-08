import { deleteSessionEntry } from "../storage/DataStorage";

export async function logout() {
  await deleteSessionEntry("session");
  chrome.action.setPopup({ popup: "UI/HTML/Login.html" });
  window.location.href = "../HTML/Login.html";
}
