document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", (event) => {
    button.disabled = true;
    let usernameAndPassword = collectFormData();

    let integrity = verifyIntegrity(usernameAndPassword);
    console.log("Button clicked:", event.target);

    if (!integrity) {
      console.log("Form data is not valid");
      alert("Missing username or password");
      button.disabled = false;
      return;
    }

    if (illegalCharacterFound(usernameAndPassword)) {
      console.log("Form data is not valid");
      alert("Invalid characters found within username or password");
      button.disabled = false;
      return;
    }

    if (button.id === "Login") {
      chrome.runtime.sendMessage(
        { chain: "login", data: usernameAndPassword },
        (response) => {
          alert(response);
          button.disabled = false;
        }
      );
    } else if (button.id === "Register") {
      chrome.runtime.sendMessage(
        { chain: "register", data: usernameAndPassword },
        (response) => {
          alert(response);
          button.disabled = false;
        }
      );
    }
  });
});

function collectFormData() {
  let usernameAndPassword = {
    Username: document.getElementById("username").value,
    Password: document.getElementById("password").value,
  };
  return usernameAndPassword;
}

function illegalCharacterFound(formData) {
  let heretical = [
    "/",
    "[",
    "<",
    ">",
    ";",
    "(",
    ")",
    "&",
    "|",
    "$",
    "]",
    "/",
    "'",
    '"',
  ];
  for (let data of Object.values(formData)) {
    for (let char of data) {
      if (heretical.includes(char)) {
        return true;
      }
    }
  }
  return false;
}

function verifyIntegrity(formData) {
  if (formData.Username == "" || formData.Password == "") {
    console.log("No username or password");
    return false;
  }
  return true;
}
