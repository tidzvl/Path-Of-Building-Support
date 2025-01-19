console.log("Start");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "buttonClicked") {
    console.log("Button in popup clicked!");
    document.body.style.backgroundColor = "lightgreen";
  }
});
