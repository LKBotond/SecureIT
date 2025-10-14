export function sendMessage(message) {
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

export function sendTargetedMessage(message, target) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(target, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

export function sendPortMessage(port, data) {
  return new Promise((resolve, reject) => {
    const handleMessage = (response) => {
      port.onMessage.removeListener(handleMessage);
      port.onDisconnect.removeListener(handleDisconnect);
      resolve(response);
    };

    const handleDisconnect = () => {
      port.onMessage.removeListener(handleMessage);
      reject(new Error("Port disconnected before response"));
    };

    port.onMessage.addListener(handleMessage);
    port.onDisconnect.addListener(handleDisconnect);

    port.postMessage({ data });
  });
}
