chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.type === "loadHtml"){
    document.querySelector(".accordion").innerHTML += request.data;
    sendResponse("Oke");
  }
  if(request.type === "changeHtml"){
    var c = request.id;
    var b = document.querySelector("."+c+"-out");
    var c = b.querySelector("a");
    c.href = request.link;
    sendResponse("Oke");
  }
  if(request.type === "UpdateTotal"){
    var c = request.id;
    var b = document.querySelector(".total"+c);
    b.textContent = request.total;
    var a = document.querySelector(".noti");
    a.value += "Item "+ c + " has been listing on https://www.pathofexile.com/trade/search/Settlers/" + request.trade_id + " \nTotal: "+ request.total + "\n" + "------\n";
    a.scrollTop = a.scrollHeight;
    // var html = `
    //   Item ${c} has been listing on <a target='_blank' href='https://www.pathofexile.com/trade/search/Settlers/${request.trade_id}'>${request.trade_id}</a>. Total: ${request.total}
    // `;
    // a.innerHTML = html;
  }
});

function toggleButton() {
  const button = document.querySelector('.detect');
  const isToggled = button.classList.toggle("toggled");
  const isImplict = document.querySelector("#not-implict");

  if (isToggled) {
    button.classList.add('starting');
    button.textContent = "Detecting...";
    document.querySelector('.note').textContent = 'Note: Click lần nữa để kết thúc và lưu dữ liệu!';
    chrome.storage.local.set({buttonState: "toggled"});
  } else {
    button.classList.remove('starting');
    button.textContent = 'Start Detect';
    document.querySelector('.note').textContent = 'Note: Click Start và đợi cho tới khi load hết item!'
    chrome.storage.local.remove("buttonState");
  }
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'buttonClicked' , implict: isImplict.checked});
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.detect');

  var myCheckbox = document.getElementById('myCheckbox');
  chrome.storage.sync.get('myCheckbox', function(data) {
      if (data.myCheckbox !== undefined) {
          myCheckbox.checked = data.myCheckbox;
      }
  });

  chrome.storage.local.get("buttonState", (result) => {
    if (result.buttonState === "toggled") {
      button.classList.add('starting');
      button.textContent = "Detecting...";
      document.querySelector('.note').textContent = 'Note: Click lần nữa để kết thúc!';
      button.classList.add("toggled");
    }
  });

  button.addEventListener("click", toggleButton);

  var a = document.querySelector('#check-list');
  var b = document.querySelector('#trade-with');
  var c = document.querySelector('#not-implict');

  const result = document.querySelector('.accordion');
  result.addEventListener("change", (event) => {
    if (!event.target.classList.contains("auto-check")){
      var type;
      if (event.target.checked === true) {
        type = 'addMod';
      }else{
        type = 'removeMod';
      }
      const a = event.target.closest("li").innerText;
      const b = event.target.closest("div").id;
      var data = {
        id: b.slice(0, -3),
        result: {
          attribute: a.trim(),
          values: [event.target.value],
          index: event.target.index,
        },
        isImplict: c.checked,
      };
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, { type: type, data: data } );
      });
    }else{
      var type;
      if (event.target.checked === true) {
        type = 'onCheck';
      }else{
        type = 'offCheck';
      }
      // console.log("autocheck");
      const a = event.target.id;
      var data = {
        id: a.slice(0, -6),
      }
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, { type: type, data: data });
      });
    }
  });
  
  a.addEventListener('change', () => {
    if (a.checked === true) {
      document.querySelector('#noti-trade-off').disabled = false;
      document.querySelector('#noti-trade').disabled = false;
      document.querySelector('#noti-trade-unique').disabled = true;
    } else {
      document.querySelector('#noti-trade-off').disabled = true;
      document.querySelector('#noti-trade').disabled = true;
      document.querySelector('#noti-trade-unique').disabled = true;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { type: "autoCheck", auto: a.checked });
    });
  });
  b.addEventListener('change', () => {
    if (b.checked === true) {
      document.querySelector('#less').disabled = false;
    } else {
      document.querySelector('#less').disabled = true;
    }
  });

  if (b.checked === true) {
    document.querySelector('#less').disabled = false;
  } else {
    document.querySelector('#less').disabled = true;
  }
  
});
