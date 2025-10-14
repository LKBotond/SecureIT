import { register } from "./logic/Register.js";
import { login } from "./logic/Login.js";
import { deleteUser, logout } from "./logic/Logout.js";
import ResponseCodes from "./logic/ResponseCodes.js";
import { toggleAutolog } from "./logic/Autolog.js";
import {
  catchCredentials,
  checkForUrl,
  infill,
  requestScraping,
  updateAndSaveRecords,
} from "./logic/BackendWebscraping.js";
import { loadLocal, loadSession } from "./storage/DataStorage.js";

const responseCodes = new ResponseCodes();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("message received", message);
  switch (message.action) {
    case "register":
      register(message.data).then((result) => {
        if (result === responseCodes.allClear) {
          sendResponse({ success: true });
          console.log("Register response sent, status", true);
        } else {
          sendResponse({
            success: false,
            message: "invalid username or password",
          });
          console.log("Register response sent, status", false);
        }
      });
      return true;
    case "login":
      login(message.data).then((result) => {
        if (result === responseCodes.allClear) {
          sendResponse({ success: true });
          console.log("Login response sent, status", true);
        } else {
          sendResponse({
            success: false,
            message: "invalid username or password",
          });
          console.log("Login response sent, status", false);
        }
      });
      return true;
    case "logout":
      logout().then(() => {
        sendResponse({ success: true });
        console.log("Logout response sent, status", true);
      });
      return true;
    case "delete":
      deleteUser(message.susPass).then((result) => {
        if (result == responseCodes.allClear) {
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false });
        }
      });
      return true;
    case "switch":
      toggleAutolog().then((result) => {
        sendResponse({ status: result });
      });
      return true;
    default:
      console.warn("Unknown message action:", message.action);
      sendResponse({ success: false, message: "Unknown action" });
      return false;
  }
});

chrome.runtime.onConnect.addListener(async (port) => {
  const sessionToken = await loadSession("session");
  if (!sessionToken) {
    return;
  }
  let urlList = await loadLocal(sessionToken.userId);
  const url = port.sender.tab.url;
  const records = checkForUrl(url, urlList);
  if (records) {
    await infill(port, sessionToken, records);
  } else {
    requestScraping(port);
    port.onMessage.addListener(async (response) => {
      const credentialToken = await catchCredentials(
        response,
        sessionToken,
        url
      );
      await updateAndSaveRecords(urlList, sessionToken.userId, credentialToken);
      port.postMessage({ action: "login" });
    });
  }
});

//i need tto rewrite the listener
