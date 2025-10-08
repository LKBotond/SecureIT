import { sendMessage } from "../../storage/Messages";

document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", async (event) => {
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
      const response = await sendMessage({
        action: "login",
        data: usernameAndPassword,
      });
      if (response.success) {
        chrome.action.setPopup({ popup: "UI/HTML/Interior.html" });
        window.location.href = "../HTML/Interior.html";
      } else {
        alert(response.message);
      }
    } else if (button.id === "Register") {
      const response = sendMessage({
        action: "register",
        data: usernameAndPassword,
      });
      if (response.success) {
        chrome.action.setPopup({ popup: "UI/HTML/Interior.html" });
        window.location.href = "../HTML/Interior.html";
      } else {
        alert(response.message);
      }
      button.disabled = false;
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
