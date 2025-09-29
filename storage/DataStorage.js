export async function saveLocally(key, value) {
  return new Promise((resolve, reject) => {
    let data = {};
    data[key] = value;
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      resolve(true);
    });
  });
}

export async function loadLocal(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
}

export async function saveSession(key, value) {
  return new Promise((resolve, reject) => {
    let data = { [key]: value };
    chrome.storage.session.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      resolve(true);
    });
  });
}

export async function loadSession(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.session.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      resolve(result[key]);
    });
  });
}

export async function deleteLocalEntry(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.storage.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}
export async function deleteSessionEntry(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.session.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
        resolve();
    });
  });
}
