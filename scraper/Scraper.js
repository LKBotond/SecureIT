async function main() {
  const loginFormAndFields = findLoginForm();
  if (!loginFormAndFields) {
    return;
  }
  const loginButton = findLoginButton(loginFormAndFields.form);
  if (!loginButton) {
    return;
  }

  const port = chrome.runtime.connect({ name: "formFound" });

  port.onMessage.addListener(async (message) => {
    switch (message.action) {
      case "scrape":
        console.log("scraping");
        const credentials = await scrapeCredentials(
          loginButton,
          loginFormAndFields
        );
        console.log("sending Credentials: ", credentials);
        port.postMessage(credentials);
        break;
      case "infill":
        infill(message.credentials, message.autolog);
        break;
      case "login":
        console.log("Login message received");
        loginButton.click();
        break;
      default:
        port.disconnect();
    }
  });
}

//HELPERS
//Searchers
const NAME_TYPES = ["text", "email", "tel"];
const PASS_TYPE = "password";

function getNameField(input) {
  if (!NAME_TYPES.includes(input.type)) {
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
  if (input.type !== PASS_TYPE) {
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
  let userName = null;
  let password = null;
  for (const input of inputs) {
    if (!userName) {
      userName = getNameField(input);
    }
    if (!password) {
      password = getPassField(input);
    }

    if (userName && password) {
      break;
    }
  }
  return { user: userName, pass: password };
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
//Getters
function getinputValue(field) {
  return field.value;
}

function getCredentials(userField, passField) {
  return { userName: userField.value, password: passField.value };
}

//Interactors
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

function scrapeCredentials(loginButton, loginFormAndFields) {
  return new Promise((resolve) => {
    loginButton.addEventListener("click", function intercept(event) {
      event.preventDefault();
      loginButton.removeEventListener("click", intercept);
      const credentials = getCredentials(
        loginFormAndFields.userField,
        loginFormAndFields.passField
      );
      resolve(credentials);
    });
  });
}

(async () => {
  await main();
})();
