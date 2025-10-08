import { register } from "./logic/Register.js";
import { login } from "./logic/Login.js";
import ResponseCodes from "./logic/ResponseCodes.js";

const responseCodes = new ResponseCodes();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("message received", message);
  if (message.chain === "register") {
    register(message.data).then((result) => {
      if (result === responseCodes.allClear) {
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
    });
  } else if (message.chain === "login") {
    login(message.data).then((result) => {
      if (result === responseCodes.allClear) {
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
    });
  }
  return true;
});
