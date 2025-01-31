var isChecking = false;

class equidItem {
  constructor() {
    this.Array = [];
  }

  add_item(item) {
    item.gen_json();
    item.gen_html();
    // item.gen_link();
    // item.get_total();
    this.Array.push(item);
  }

  save_data(){
    sessionStorage.setItem("equidItem", JSON.stringify(this.Array));
  }

  async check_total() {
    for (let item of this.Array) {
      if(item.search_on == false) continue;
      item.get_total();
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }

  check_containts(item) {
    var str = item.to_string();
    for (var i = 0; i < this.Array.length; i++) {
      if (this.Array[i].to_string() == str) {
        return true;
      }
    }
    return false;
  }
  print_link() {
    for (var i = 0; i < this.Array.length; i++) {
      console.log(this.Array[i].search_link);
    }
  }

  print_total() {
    for (var i = 0; i < this.Array.length; i++) {
      console.log(this.Array[i].total + " " + this.Array[i].id);
    }
  }
}

class Item {
  constructor(name, rare) {
    this.rare = rare;
    this.name = name;
    this.id = name.replace(/[^a-zA-Z]/g, "");
    this.baseName = name.split(",")[1];
    this.modified = [];
    this.search_json = "";
    this.search_link = "";
    this.total = 0;
    this.trade_id = "";
    this.Postfixhtml = `
                </ul>
              </div>
            </div>
          </div>
    `;
    this.html = "";
    this.search_on = false;
  }

  create_with_json(json){
    console.log(json);
  }

  gen_html(type = "loadHtml"){
    var link = this.gen_link();
    // const shortenedName = this.name.substring(0, 30).padEnd(30, '\u00A0');
    const shortenedName = this.name.length > 30 ? this.name.substring(0, 27) + '...' : this.name.substring(0, 30).padEnd(30, '\u00A0');
    var Prefixhtml = `
    <div class="accordion-item card ${this.name.replace(/[^a-zA-Z]/g, "")}-out">
            <h3 class="accordion-header fs-tiny">
              <button type="button" class="accordion-button collapsed noti-card" data-bs-toggle="collapse" data-bs-target="#${this.name.replace(/[^a-zA-Z]/g, "")}" aria-expanded="false">
                <strong><a href="${link}">${shortenedName}</a> Total: <span class="total${this.name.replace(/[^a-zA-Z]/g, "")}">0</span>    </strong>
                <span><input class="auto-check" type="checkbox" id="${this.name.replace(/[^a-zA-Z]/g, "")}-check"><label for="${this.name.replace(/[^a-zA-Z]/g, "")}-check">Auto Check?</label></span>
              </button>
            </h3>
          
            <div id="${this.name.replace(/[^a-zA-Z]/g, "")}" class="accordion-collapse collapse" data-bs-parent="#accordionStyle1">
              <div class="accordion-body" id="${this.name.replace(/[^a-zA-Z]/g, "")}-in">
                <ul class="result">
                `;
    this.html = Prefixhtml + this.html + this.Postfixhtml;
    chrome.runtime.sendMessage(
      { type: type, data: this.html , id: this.id, link: link },
      function (response) {
        console.log(response);
      }
    );
  }
  add_modified(modified, isImplict = false) {
    // console.log(modified);  
    var value = modified.values;
    // console.log(modified.index);
    var index = modified.index;
    modified = String(modified.attribute);
    if(!isImplict){
      this.html += `<li>
        <input index="${index}" value="${value}" class="mx-2 my-1" type="checkbox" id="${this.name.replace(/[^a-zA-Z]/g, "")+modified.replace(/[^a-zA-Z]/g, "")}" checked>
        <label for="${this.name.replace(/[^a-zA-Z]/g, "")+modified.replace(/[^a-zA-Z]/g, "")}">${modified}</label>
      </li>`;
      this.modified.push({
        mod: modified,
        ids: this.get_id_modified(modified, isImplict),
        values: value,
      });
    } else {
      if(index != 4){
        this.html += `<li>
          <input index="${index}" value="${value}" class="mx-2 my-1" type="checkbox" id="${this.name.replace(/[^a-zA-Z]/g, "")+modified.replace(/[^a-zA-Z]/g, "")}" checked>
          <label for="${this.name.replace(/[^a-zA-Z]/g, "")+modified.replace(/[^a-zA-Z]/g, "")}">${modified}</label>
        </li>`;
        this.modified.push({
          mod: modified,
          ids: this.get_id_modified(modified, isImplict),
          values: value,
        });
      }else{
        this.html += `<li>
          <input index="${index}" value="${value}" class="mx-2 my-1" type="checkbox" id="${this.name.replace(/[^a-zA-Z]/g, "")+modified.replace(/[^a-zA-Z]/g, "")}">
          <label for="${this.name.replace(/[^a-zA-Z]/g, "")+modified.replace(/[^a-zA-Z]/g, "")}">${modified}</label>
        </li>`;
      }
    }
  }

  remove_modified(modified) {
    var value = modified.values;
    var index = modified.index;
    modified = String(modified.attribute);
    // this.modified.splice(index, 1);
    this.modified = this.modified.filter(item => item.mod !== modified);
    this.html = this.html.replace(
      `<li>
        <input index="${index}" value="${value}" class="mx-2 my-1" type="checkbox" id="${this.name.replace(/[^a-zA-Z]/g, "")+modified.replace(/[^a-zA-Z]/g, "")}" checked>
        <label for="${this.name.replace(/[^a-zA-Z]/g, "")+modified.replace(/[^a-zA-Z]/g, "")}">${modified}</label>
      </li>`,
      ""
    );
  }

  gen_json(online = false) {
    if (!online) {
      var online = "any";
    }
    var modified = this.modified;
    if (this.baseName === "") {
      var prefix = `{"query": {"stats": [`;
    } else {
      var prefix = `{"query": {"type": "` + this.baseName + `","stats": [`;
    }
    var postfix = `]},"status": {"option": "${online}"}}`;
    var fix = "";
    var i = 0;
    for (let stat of modified) {
      i++;
      if (stat.ids.length == 0) continue;
      if (stat.values.length < 2) {
        var add_fix = this.gen_stat(stat.ids);
      } else {
        var add_fix = this.gen_stat(stat.ids, stat.values);
      }
      if (i < modified.length) add_fix += ",";
      fix += add_fix;
    }

    if (fix.slice(-1) == ",") fix = fix.slice(0, -1);
    var all_fix = prefix + fix + postfix;
    this.search_json = all_fix;
  }

  gen_stat(list_of_modified, list_of_values = [1000, -1000]) {
    // var max = parseInt(list_of_values[0]);
    // var min = parseInt(list_of_values[1]);
    var min = -1000;
    var max = 1000;
    // console.log(list_of_values);
    var fix = "";
    if (list_of_modified.length == 0) return fix;
    var prefix = `{
      "type": "count",
      "value": {
        "max": 1,
        "min": 1
      },
      "filters": [`;
    var postfix = `],
      "disabled": false
    }`;
    var i = 0;
    for (let mod of list_of_modified) {
      fix +=
        `{"id": "` +
        mod.id +
        `","value": {"max": ` +
        max +
        `,"min": ` +
        min +
        `},"disabled": false}`;
      if (i < list_of_modified.length - 1) fix += ",";
      i++;
    }
    var all_fix = prefix + fix + postfix;
    return all_fix;
  }

  to_string() {
    return this.name + " " + this.modified;
  }

  get_id_modified(modified, isImplict) {
    modified = modified.replace(" -", " +");
    modified = modified.replace("-#", "+#");
    const json = JSON.parse(localStorage.getItem("data"));
    // console.log(modified);
    // const regex = new RegExp(modified.replace(/#/g, "(\\d+|#)"), "g");
    const regex = new RegExp(
      modified
        .replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
        .replace(/#/g, "(\\d+|#)"),
      "g"
    );
    // const regexPerfect = new RegExp(
    //   "^" +
    //     modified
    //       .replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
    //       .replace(/#/g, "(\\d+|#)") +
    //     "$"
    // );
    const regexPerfect = new RegExp(
      "^" +
        modified
          .replace(/([.*?^=!:${}()|\[\]\/\\])/g, "\\$1")
          .replace(/#/g, "(\\d+|#)")
          .replace(/\+/g, "\\+") +
        "$"
    );
    // console.log(regex);
    // console.log(regexPerfect);

    var filteredEntries = [];
    // console.log(modified)
    // console.log(regex);
    var much = false;
    var before_implict = "";
    json.result.forEach((result) => {
      result.entries.forEach((entry) => {
        if (
          entry.text.match(regexPerfect) &&
          much === false &&
          filteredEntries.length <= 100
        ) {
          filteredEntries.push(entry);
        } else if (entry.text.match(regexPerfect)) {
          if (much === false) {
            much = true;
            filteredEntries = [];
          }
          filteredEntries.push(entry);
        }
      });
    });
    const mod2 = modified + " (Local)";
    // console.log(mod2);
    const regexPerfect2 = new RegExp(
      "^" +
        mod2
          .replace(/([.*?^=!:${}()|\[\]\/\\])/g, "\\$1")
          .replace(/#/g, "(\\d+|#)")
          .replace(/\+/g, "\\+") +
        "$"
    );
    var much = false;
    json.result.forEach((result) => {
      result.entries.forEach((entry) => {
        if (
          entry.text.match(regexPerfect2) &&
          much === false &&
          filteredEntries.length <= 100
        ) {
          filteredEntries.push(entry);
        } else if (entry.text.match(regexPerfect2)) {
          if (much === false) {
            much = true;
            filteredEntries = [];
          }
          filteredEntries.push(entry);
        }
      });
    });
    return filteredEntries;
  }

  gen_link() {
    var prefix = "https://www.pathofexile.com/trade/search/Settlers?q=";
    var encode = encodeURIComponent(this.search_json);
    var link = prefix + encode;
    this.search_link = link;
    return link;
  }

  get_total() {
    const self = this;
    const body = JSON.stringify(this.search_json);
    const url_api = "https://www.pathofexile.com/api/trade/search/Settlers";
    chrome.runtime.sendMessage(
      { type: "getTotal", data: body },
      function (response) {
        console.log(response);
        self.total = parseInt(response.total);
        self.trade_id = response.id;
        chrome.runtime.sendMessage({
          type: "UpdateTotal",
          total: self.total,
          id: self.id,
          trade_id: self.trade_id,
        });
      }
    );
    // console.log(response);
  }
}

if (!window.location.href.includes("pobb.in")) {
  throw null;
}
console.log("Start");

if (localStorage.getItem("data") === null) {
  console.log("fetch");
  fetch(chrome.runtime.getURL("json/stat.json"))
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      localStorage.setItem("data", JSON.stringify(data));
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      return null;
    });
}
var start = false;

let observers = [];

const targetNodes = document.querySelectorAll(
  "div.absolute.z-30.pointer-events-none.hidden.overflow-hidden"
);

const config = { attributes: true, childList: true, subtree: true };

const returnedValues = new Set();

let currentItemContent = "";

const eqItem = new equidItem();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "buttonClicked") {
    // console.log(request.implict);
    const isImplict = request.implict;
    if (!start) {
      start = true;
      const callback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
          if (mutation.type === "childList" || mutation.type === "attributes") {
            const itemContent = Array.from(
              mutation.target.querySelectorAll("div")
            )
              .map((div) => div.textContent)
              .join("\n");
            if (itemContent !== currentItemContent) {
              returnedValues.clear();
              currentItemContent = itemContent;
            }
            var name = "";
            mutation.target.querySelectorAll("div").forEach((div) => {
              const divText =
                div.childNodes.length === 1 &&
                div.childNodes[0].nodeType === Node.TEXT_NODE
                  ? div.textContent
                  : "";
              if (divText && !returnedValues.has(divText)) {
                name += divText + ",";
                returnedValues.add(divText);
              }
            });
            if (name != "") {
              var rarity = mutation.target.getAttribute("data-rarity");
              // console.log(rarity);
              // console.log(mutation.target);
              var item = new Item(name, rarity);
              var partEle = mutation.target.querySelector(
                ".p-2.pt-1.leading-tight"
              ).innerHTML;
              var parts = partEle.split(/(?=<ul>|<!---->)/);
              parts.forEach((part, index) => {
                var b = document.createElement("div");
                b.innerHTML = part;
                // mutation.target.querySelectorAll("ul li").forEach((ul) => {
                b.querySelectorAll("li").forEach((ul) => {
                  if (!returnedValues.has(ul.textContent)) {
                    var liStr = ul.textContent;
                    let extractValues = (str) => {
                      let values = str.match(
                        /([+\-]?\d+(\.\d+)?%?)|(\(\d+-\d+\)%)/g
                      );
                      if (values) {
                        return values.map((value) =>
                          value.replace(/[()%]/g, "").replace("%", "").trim()
                        );
                      }
                      return [];
                    };
                    let values = extractValues(liStr);
                    let attribute = liStr;
                    // console.log(attribute);
                    values.forEach((value, index) => {
                      if (Math.abs(value) > 0 && index === 0) {
                        attribute = attribute.replace(Math.abs(value), "#");
                      } else {
                        attribute = attribute.replace(value, "#");
                      }
                    });
                    attribute = attribute.replace(/[()]/g, "").trim();
                    attribute = attribute.replace(/#+/g, "#");
                    // console.log(attribute);
                    let result = {
                      attribute: attribute,
                      values: values.map((value) => value.replace("%", "")),
                      index: index,
                    };
                    // console.log(result);
                    if (isImplict) {
                      item.add_modified(result, isImplict);
                    } else {
                      item.add_modified(result);
                    }
                    returnedValues.add(result);
                  }
                });
              });
              if (!eqItem.check_containts(item)) {
                eqItem.add_item(item);
              }
            }
          }
        }
      };

      targetNodes.forEach((node) => {
        const observer = new MutationObserver(callback);
        observer.observe(node, config);
        observers.push(observer);
      });
      const items = document.querySelectorAll('img');

      function triggerMouseover() {
          items.forEach((item, index) => {
              setTimeout(() => {
                  const event = new Event('mouseover');
                  item.dispatchEvent(event);
              }, index * 1); 
          });
      }

      triggerMouseover();

    } else {
      start = false;
      observers.forEach((observer) => observer.disconnect());
      observers = [];
      // eqItem.check_total()
      // eqItem.save_data();
      console.log(eqItem.Array);
      // waitCheckTotal(eqItem);
    }
  }
});

async function waitCheckTotal(eqItem) {
  await eqItem.check_total();
  console.log(eqItem.Array);
}

function print_array(){
  if(eqItem.Array.length == 0) return;
  console.log(eqItem.Array);
}

var checkState = false;
async function auto_check(){
  if(isChecking || !checkState) return;
  isChecking = true;
  await waitCheckTotal(eqItem);
  isChecking = false;
}
(function() {
  var container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.right = '0';
  container.style.width = '500px';
  container.style.height = window.innerHeight + 'px';
  container.style.backgroundColor = 'white';
  container.style.border = '1px solid black';
  container.style.zIndex = '10000';
  document.body.appendChild(container);

  var iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('popup.html');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  container.appendChild(iframe);

  document.body.style.marginRight = '500px';

  window.addEventListener('resize', function() {
      container.style.height = window.innerHeight + 'px';
      document.body.style.marginRight = '500px';
  });
  setInterval(auto_check, 1000);
})();
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.type === "addMod"){
    console.log(request);
    var find_id = request.data.id;
    // var data = sessionStorage.getItem("equidItem");
    for (var i = 0; i < eqItem.Array.length; i++) {
      if (eqItem.Array[i].id == find_id) {
        eqItem.Array[i].add_modified(request.data.result, request.data.isImplict);
        // console.log(eqItem.Array[i]);
        eqItem.Array[i].gen_json();
        eqItem.Array[i].gen_html("changeHtml");
      }
    }
  }
  if (request.type === "removeMod"){
    console.log(request);
    var find_id = request.data.id;
    for (var i = 0; i < eqItem.Array.length; i++) {
      if (eqItem.Array[i].id == find_id) {
        eqItem.Array[i].remove_modified(request.data.result);
        eqItem.Array[i].gen_json();
        eqItem.Array[i].gen_html("changeHtml");
      }
    }
  }
  if (request.type === "onCheck"){
    var find_id = request.data.id;
    for (var i = 0; i < eqItem.Array.length; i++) {
      if (eqItem.Array[i].id == find_id) {
        eqItem.Array[i].search_on = true;
        break;
      }
    }
  }
  if(request.type === "offCheck"){
    var find_id = request.data.id;
    for (var i = 0; i < eqItem.Array.length; i++) {
      if (eqItem.Array[i].id == find_id) {
        eqItem.Array[i].search_on = false;
        break;
      }
    }
  }
  if(request.type === "autoCheck"){
    checkState = request.auto;
  }
});

