function toggleButton() {
  const button = document.querySelector('.detect');
  const isToggled = button.classList.toggle("toggled");

  if (isToggled) {
    button.classList.add('starting');
    button.textContent = "Detecting...";
    document.querySelector('.note').textContent = 'Note: Click lần nữa để kết thúc!';
    chrome.storage.local.set({buttonState: "toggled"});
  } else {
    button.classList.remove('starting');
    button.textContent = 'Start Detect';
    document.querySelector('.note').textContent = 'Note: Click Start sau đó di chuột qua các item của build trong pob để lấy dữ liệu!'
    chrome.storage.local.remove("buttonState");
  }
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'buttonClicked' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.detect');

  chrome.storage.local.get("buttonState", (result) => {
    if (result.buttonState === "toggled") {
      button.classList.add('starting');
      button.textContent = "Detecting...";
      document.querySelector('.note').textContent = 'Note: Click lần nữa để kết thúc!';
      button.classList.add("toggled");
    }
  });

  button.addEventListener("click", toggleButton);

  // if (button) {
  //   button.addEventListener('click', () => {
  //     if (!localStorage.getItem('isStarted') || localStorage.getItem('isStarted') === 'flase' || localStorage.getItem('isStarted') === false) {
  //       localStorage.setItem('isStarted', 'true');
  //       button.classList.add('starting');
  //       button.textContent = 'Detecting...';
  //       document.querySelector('.note').textContent = 'Note: Click lần nữa để kết thúc!';
  //     }else{
  //       localStorage.clear();
  //       button.classList.remove('starting');
  //       button.textContent = 'Start Detect';
  //       document.querySelector('.note').textContent = 'Note: Click Start sau đó di chuột qua các item của build trong pob để lấy dữ liệu!'
  //     }
  //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //       chrome.tabs.sendMessage(tabs[0].id, { action: 'buttonClicked' });
  //     });
  //   });
  // } else {
  //   console.error('Button not found.');
  // }
  var a = document.querySelector('#check-list');
  var b = document.querySelector('#trade-with');
  
  a.addEventListener('change', () => {
    if (a.checked === true) {
      document.querySelector('#noti-trade').disabled = false;
      document.querySelector('#noti-trade-unique').disabled = false;
    } else {
      document.querySelector('#noti-trade').disabled = true;
      document.querySelector('#noti-trade-unique').disabled = true;
    }
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
