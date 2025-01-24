chrome.runtime.onInstalled.addListener(() => {
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'fetch_data') {
    fetch(message.url, {
      method: message.method || 'GET',
      headers: message.headers || { 'Content-Type': 'application/json' },
      body: JSON.stringify(message.body) || null
    })
    .then(response => response.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(error => sendResponse({ success: false, error }));
    return true; 
  }
});
