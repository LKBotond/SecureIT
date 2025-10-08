import KDF from "./security/KDF";
import AESGCM from "./security/Encryption";
import UserToken from "./tokens/UserToken";
import { register } from "./logic/Register";
import { login } from "./logic/Login";
import ResponseCodes from "./logic/ResponseCodes";
const responseCodes = new ResponseCodes();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.chain === "register") {
    register(message.data).then((result) => {
      if (result === responseCodes.allClear()) {
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
    });
  } else if (message.chain === "login") {
    login(message.data).then((result) => {
      if (result === responseCodes.allClear()) {
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
    });
  }
  return true;
});
