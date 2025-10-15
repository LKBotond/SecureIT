const User = {
  username: null,
  password: null,
  login: function (username, susPass) {
    const record = JSON.parse(sessionStorage.getItem(username));
    if (record== susPass) { 
      console.log("Login successful!");
      return true;
    } else {
      console.log("Login failed!");
      return false;
    }
  },
  register: function (username, password) {
    try {
      this.username = username;
      this.password = password;
      sessionStorage.setItem(this.username, JSON.stringify(this.password));
      return true;
    } catch {
      return false;
    }
  },
};

//Main
document.addEventListener("DOMContentLoaded", function () {
  //test form handling
  const form = document.getElementById("LoginForm");
  if (form) {
    let current = User;
    const register = document.getElementById("register");
    register.addEventListener("click", function (event) {
      event.preventDefault();
      username = form.querySelector("#login").value;
      password = form.querySelector("#password").value;
      if (current.register(username, password)) {
        alert("Registration succesfull!");
      }
    });

    form.onsubmit = function (event) {
      event.preventDefault();
      username = form.querySelector("#login").value;
      password = form.querySelector("#password").value;
      if (current.login(username, password)) {
        window.location.href = "TestSuccess.html";
      } else {
        window.location.href = "TestFailed.html";
      }
    };
  }

  //return manouver
  const backHome = document.getElementById("back");
  if (backHome) {
    backHome.addEventListener("click", function () {
      window.location.href = "test.html";
    });
  }
});
