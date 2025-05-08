console.log("Service worker starting");

import {
  getLocal,
  storeLocally,
  getSession,
  DELETE,
} from "./Helpers/Helpers.js";

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  let status = false;
  if (request.action === "logged") {
    console.log("Login chain reached");
    status = true;
    chrome.action.setPopup({ popup: "UI/logged.html" });
  } else if (request.action === "Out") {
    status = false;
    chrome.action.setPopup({ popup: "UI/Index.html" });
  }
  console.log("Logged in status set to " + status);
  await storeLocally("logged", status);
});

chrome.webNavigation.onCompleted.addListener(async function (tab) {
  console.log("Webnavigation is completed");
  const login_Status = await getLocal("logged");
  console.log("Login status is ", login_Status);
  if (!login_Status) {
    return;
  }
  let current_URL = tab.url;

  const port = chrome.tabs.connect(tab.tabId, { name: "backchanel" });
  console.log("Port created", port);
  if (port == null) {
    console.log("Port does not exist");
    return;
  }

  const session = await getSession("session");
  let URL_List = await getLocal(session.UserID);
  if (URL_List == null) {
    console.log("URL List is ", URL_List);
    URL_List = [];
  }
  const credentials = URL_List.find((item) =>
    Object.values(item).includes(current_URL)
  );

  if (!credentials) {
    port.postMessage({ message: "scrape", session: session });
    console.log("Scraping for credentials");
    port.onMessage.addListener(async function (response) {
      console.log("response recieved from content script");
      if (response.message == "noForm") {
        console.log("no form found disconnecting port");
        port.disconnect();
        return;
      }
      if (response.message == "scraped") {
        console.log("Scraping done, now storing credentials");
        const credentials = response.payload;
        credentials.URL = current_URL;
        URL_List.push(credentials);
        await storeLocally(session.UserID, URL_List);
        console.log("Credentials stored successfully", URL_List);
        port.disconnect();
        return;
      }
    });
  }
  if (credentials) {
    port.postMessage({
      message: "infill",
      payload: credentials,
      session: session,
    });
    console.log("Infill message sent");

    port.onMessage.addListener(function (response) {
      console.log("response recieved from content script", response);
      if (response.message == "infilled") {
        console.log("Infill done");
        port.disconnect();
        return;
      }
    });
  }
});

//tested and works
