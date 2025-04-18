export async function GetActiveTab() {
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


//store the data locally
export async function StoreLocally(Key, Value) {
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


//load the data from local storage
export async function GetLocal(Key) {
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

export async function DELETE(Key) {
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

export async function Inject(tabID, Script) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript({
      target: { tabId: tabID },
      files: [Script]
    }, () => {
      if (chrome.runtime.lastError) {
        console.log("Injection Failed", chrome.runtime.lastError)
        reject(chrome.runtime.lastError);
      } else {
        console.log("Injection succesfull")
        resolve();
      }
    });
  });
}

export function CollectFormData() {
  let Preliminary = {
    Username: document.getElementById("username").value,
    Password: document.getElementById("password").value,
  };
  return Preliminary;
}

export function VerifyIntegrity(FormData){
if (FormData.Username == "" || FormData.Password == "") {
    console.log("No username or password provided");
    return false;
  }
  return true;
}