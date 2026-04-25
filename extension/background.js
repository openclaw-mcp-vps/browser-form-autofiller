const DASHBOARD_URL = "http://localhost:3000/tool";

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: "#0ea5e9" });
  chrome.action.setBadgeText({ text: "AI" });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "OPEN_DASHBOARD") {
    chrome.tabs.create({ url: DASHBOARD_URL }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (message?.type === "SET_BADGE") {
    const text = typeof message.text === "string" ? message.text.slice(0, 4) : "";
    chrome.action.setBadgeText({ text });
    sendResponse({ ok: true });
    return true;
  }

  return false;
});
