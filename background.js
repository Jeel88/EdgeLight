// Background service worker for EdgeLight
// Currently minimal as most logic is in content scripts and popup.

chrome.runtime.onInstalled.addListener(() => {
  console.log("EdgeLight Extension Installed");
});
