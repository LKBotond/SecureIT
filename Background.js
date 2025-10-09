import { register } from "./logic/Register.js";
import { login } from "./logic/Login.js";
import ResponseCodes from "./logic/ResponseCodes.js";

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
  } else if (message.action === "delete") {
  }
  return true;
});
