console.log("Service worker starting");
import { GetLocal, StoreLocally, DELETE } from "./Helpers/Helpers.js";

//constants

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
  await StoreLocally("logged", status);
});

chrome.webNavigation.onCompleted.addListener(async function (tab) {
  console.log("Webnavigation is completed");
  const LoginStatus = await GetLocal("logged");
  console.log("Login status is ", LoginStatus);
  if (!LoginStatus) {
    return;
  }
  let CurrentURL = null;
  const port = chrome.tabs.connect(tab.tabId, { name: "Messaging" });
  port.onMessage.addListener(function (response) {
    console.log("Port is set up and ready to go");
    if (response.message == "connected") {
      console.log("Port is connected to content script");
      CurrentURL = response.url;
    }
  });

  const Session = await GetLocal("session");
  let URL_List = await GetLocal(Session.UserID);
  if (URL_List == null) {
    URL_List = [];
  }

  const Credentials = URL_List.find((item) => item[CurrentURL]);
  if (!Credentials) {
    port.postMessage({ message: "scrape" });
    console.log("Scraping for credentials");
    port.onMessage.addListener(async function (response) {
      console.log("response recieved from content script", response);
      if (response.message == "scraped") {
        console.log("Scraping done, now storing credentials");
        const Credentials = response.payload;
        URL_List.push({ [CurrentURL]: Credentials });
        await StoreLocally(Session.UserID, URL_List);
        console.log("Credentials stored successfully", URL_List);
        return;
      }
    });
  }
  if (Credentials) {
    console.log("Credentials found", Credentials);
    const Extracted=Credentials[CurrentURL];
    console.log("Extracted credentials", Extracted);
    port.postMessage({ message: "infill", payload: Extracted });
    console.log("Filling credentials", Extracted);
    port.onMessage.addListener(function (response) {
      console.log("response recieved from content script", response);
      if (response.message == "infilled") {
        console.log("Filling done");
      }
    });
  }
});

//tested and works
chrome.windows.onRemoved.addListener(async function () {
  try {
    await DELETE("session");
    console.log("session Deleted");
  } catch (error) {
    console.log("error catched " + error);
  }
});

//Clean this up and make it work
