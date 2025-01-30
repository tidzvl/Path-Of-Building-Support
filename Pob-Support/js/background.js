chrome.runtime.onInstalled.addListener(() => {
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  });
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.type === "getTotal"){
    // console.log(request.data);
    let query = request.data;
    let response;
    fetch('https://www.pathofexile.com/api/trade/search/Settlers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // body: JSON.stringify(query)
      body: JSON.parse(query)
    })
    .then(response => response.json())
    .then(data => sendResponse(data))
    .catch(error => sendResponse(error));
    // sendResponse(response);
  }
  return true;
});
