import { register } from "./logic/Register.js";
import { login } from "./logic/Login.js";
import { deleteUser, logout } from "./logic/Logout.js";
import ResponseCodes from "./logic/ResponseCodes.js";
import { toggleAutolog } from "./logic/Autolog.js";

const responseCodes = new ResponseCodes();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("message received", message);
  if (message.action === "register") {
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
  } else if (message.action === "login") {
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
  } else if (message.action === "logout") {
    logout().then(() => {
      sendResponse({ success: true });
      console.log("Logout response sent, status", true);
    });
  } else if (message.action === "delete") {
    deleteUser(message.susPass).then((result) => {
      if (result == responseCodes.allClear) {
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
    });
  } else if (message.action === "switch") {
    toggleAutolog().then((result) => {
      sendResponse({ status: result });
    });
  }
  return true;
});

chrome.webNavigation.onCompleted.addListener(async (tab) => {
  
});
