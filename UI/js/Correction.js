import { sendMessage } from "../../storage/Messages.js";
document.getElementById("submit").addEventListener("click", async (event) => {
  event.preventDefault();

  if (!confirm("This will update your stored data, are you sure?")) {
    console.log("User cancelled the update");
    return;
  }
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let URL = document.getElementById("URL").value;
  if (username == "" || password == "" || URL == "") {
    alert("Please fill in all fields");
    return;
  }

  const response = await sendMessage({
    action: "update",
    username: username,
    password: password,
    url: URL,
  });

  if (response) {
    alert("Data changed");
    window.location.href = "../HTML/Interior.html";
  } else {
    alert("Something went rather wrong");
  }
});

document.getElementById("back").addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "../HTML/Interior.html";
});
