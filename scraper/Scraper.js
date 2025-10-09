const nameTypes = ["text", "email", "tel"];
const passType = "password";

function getNameField(input) {
  if (!nameTypes.includes(input.type)) {
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
  if (input.type !== passType) {
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

function findLoginButton(form) {
  const buttons = form.querySelectorAll("button");
  if (!buttons) {
    console.log("No buttons found");
    return null;
  }
  const attributes = ["name", "id", "placeholder", "class", "type"];
  const keywords = ["log", "in", "sign", "next"];
  for (const button of buttons) {
    for (const keyword of keywords) {
      const value = (button.getAttribute(attributes) || "").toLowerCase();
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

function searchFormInputs(form) {
  const inputs = form.querySelectorAll("input");
  const userName = null;
  const password = null;
  inputs.forEach((input) => {
    if (!userName) {
      userName = getNameField(input);
    }
    if (!password) {
      password = getPassField(input);
    }

    if (userName && password) {
      return { user: userName, pass: password };
    }
  });
}

function findLoginForm() {
  const forms = document.querySelectorAll("form");
  if (!forms) {
    return null;
  }

  for (const form of forms) {
    const fields = searchFormInputs(form);
    return { form: form, userField: fields.user, passField: fields.pass };
  }
}

function getinputValue(field) {
  return field.value;
}

function infill(credentials, autolog) {
  const loginFormAndFields = findLoginForm();
  if (!loginFormAndFields) {
    return;
  }
  const loginForm = loginFormAndFields.form;
  const userField = loginFormAndFields.userField;
  const passField = loginFormAndFields.passField;
  const loginButton = findLoginButton(loginForm);

  userField.value = credentials.userName;
  passField.value = credentials.password;
  if (autolog) {
    loginButton.click();
  }
}

function getCredentials(userField, passField) {
  return { userName: userField.value, password: passField.value };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const loginFormAndFields = findLoginForm();

  if (!loginFormAndFields) {
    sendResponse({ status: false, data: "noForm" });
  }

  const loginButton = findLoginButton(loginFormAndFields.form);

  if (!loginButton) {
    sendResponse({ status: false, data: "noLoginButton" });
  }

  if (message.action == "scrape") {
    loginButton.addEventListener("click", (event) => {
      event.preventDefault();
      const credentials = getCredentials(
        loginFormAndFields.userField,
        loginFormAndFields.passField
      );
      sendResponse({ status: true, data: credentials });
      loginButton.click();
    });
  } else if (message.action == "infill") {
    infill(message.credentials, message.autolog);
    sendResponse({ success: true });
  }
  return true;
});
