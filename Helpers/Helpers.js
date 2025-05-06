export async function getActiveTab() {
  return new Promise((resolve, reject) =>
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tabs[0]);
      }
    })
  );
}

export function getUrlRoot(url) {
  try {
    const real = new URL(url);
    return "${real.protocol}//${real.host}";
  } catch (error) {
    return null;
  }
}

export async function storeLocally(Key, Value) {
  return new Promise((resolve, reject) => {
    let data = {};
    data[Key] = Value;
    chrome.storage.local.set(data, function () {
      if (chrome.runtime.lastError) {
        console.error("Error storing data:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log("Data stored successfully");
        resolve();
      }
    });
  });
}

export async function getLocal(Key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(Key, function (result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[Key]);
      }
    });
  });
}

export async function storeSession(Key, Value) {
  return new Promise((resolve, reject) => {
    let data = {};
    data[Key] = Value;
    chrome.storage.session.set(data, function () {
      if (chrome.runtime.lastError) {
        console.error("Error storing data:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log("Data stored successfully");
        resolve();
      }
    });
  });
}
export async function getSession(Key) {
  return new Promise((resolve, reject) => {
    chrome.storage.session.get(Key, function (result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[Key]);
      }
    });
  });
}

export async function DELETE(Key) {
  if (Key == "session") {
    return new Promise((resolve, reject) => {
      chrome.storage.session.remove(Key, function () {
        if (chrome.runtime.lastError) {
          console.error("Error removing data:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log("Data removed successfully");
          resolve();
        }
      });
    });
  }
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(Key, function () {
      if (chrome.runtime.lastError) {
        console.error("Error removing data:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log("Data removed successfully");
        resolve();
      }
    });
  });
}

export function collectFormData() {
  let Preliminary = {
    Username: document.getElementById("username").value,
    Password: document.getElementById("password").value,
  };
  return Preliminary;
}

export function verifyIntegrity(FormData, password_Length) {
  if (FormData.Username == "" || FormData.Password == "") {
    console.log("No username or password provided");
    return false;
  }
  if (FormData.Password.length < password_Length) {
    console.log("Password is too short");
    return false;
  }
  return true;
}

export function verboten(FormData) {
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
  for (let data of Object.values(FormData)) {
    for (let char of data) {
      if (heretical.includes(char)) {
        return true;
      }
    }
  }
  return false;
}
