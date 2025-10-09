//necesary Utility functions:
async function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

//Searchers
const name_Types = ["text", "email", "tel"];
const pass_Type = "password";


function gettNameField(input) {
  if (!name_Types.includes(input.type)) {
    return false;
  }
  const attributes = ["name", "id", "placeholder", "class"];
  const keywords = ["user", "mail", "phone", "ident"];
  for (const keyword of keywords) {
    for (const attribute of attributes) {
      const value = (input.getAttribute(attribute) || "").toLowerCase();
      if (value.includes(keyword)) {
        return input;
      }
    }
  }
  return false;
}

function getPassField(input) {
  if (input.type !== pass_Type) {
    return false;
  }
  const attributes = ["name", "id", "placeholder", "class"];
  const keyword = "pass";
  for (const attribute of attributes) {
    const value = (input.getAttribute(attribute) || "").toLowerCase();
    if (value.includes(keyword)) {
      return input;
    }
  }
  return false;
}

function getLoginButton(form) {
  const buttons = form.querySelectorAll("button");
  if (!buttons) {
    console.log("No buttons found");
    return null;
  }
  const attributes = ["name", "id", "placeholder", "class", "type"];
  const keywords = ["log", "in", "sign", "next"];
  for (const button of buttons) {
    for (const keyword of keywords) {
      const value = (button.getAttribute(attr) || "").toLowerCase();
      if (value.includes(keyword)) {
        return button;
      }
      if (
        (button.textContent || "").toLowerCase().includes(keyword) ||
        Array.from(button.querySelectorAll("*")).some((child) =>
          (child.textContent || "").toLowerCase().includes(keyword)
        )
      ) {
        return button;
      }
    }
  }
  return null;
}
//----------------------------------------------------------------------------------