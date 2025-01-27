class equidItem {
  constructor() {
    this.Array = [];
  }

  add_item(item) {
    item.gen_json();
    // item.gen_link();
    // item.get_total();
    this.Array.push(item);
  }

  async check_total(){
    for (let item of this.Array) {
      item.get_total();
      await new Promise(resolve => setTimeout(resolve, 60000));
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
  print_link(){
    for (var i = 0; i < this.Array.length; i++) {
      console.log(this.Array[i].search_link);
    }
  }

  print_total(){
    for (var i = 0; i < this.Array.length; i++) {
      console.log(this.Array[i].total + ' ' + this.Array[i].id);
    }
  }
}

class Item {
  constructor(name, rare) {
    this.rare = rare;
    this.name = name;
    this.baseName = name.split(",")[1];
    this.modified = [];
    this.search_json = "";
    this.search_link = "";
    this.total = 0;
    this.trade_id = "";
  }

  add_modified(modified) {
    var value = modified.values;
    modified = String(modified.attribute);

    this.modified.push({
      mod: modified,
      ids: this.get_id_modified(modified),
      values: value,
    });
  }

  gen_json() {
    var modified = this.modified;
    if (this.baseName === "") {
      var prefix = `{"query": {"stats": [`;  
    }else{
      var prefix = `{"query": {"type": "` + this.baseName + `","stats": [`;
    }
    var postfix = `]},"status": {"option": "any"}}`;
    var fix = "";
    var i = 0;
    for (let stat of modified) {
      i++;
      if (stat.ids.length == 0) continue;
      var add_fix = this.gen_stat(stat.ids, stat.values);
      if (i < modified.length) add_fix += ",";
      fix += add_fix;
    }

    if (fix.slice(-1) == ",") fix = fix.slice(0, -1);
    var all_fix = prefix + fix + postfix;
    this.search_json = all_fix;
  }

  gen_stat(list_of_modified, list_of_values) {
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
        `","value": {"max": 1000,"min": -1000},"disabled": false}`;
      if (i < list_of_modified.length - 1) fix += ",";
      i++;
    }
    var all_fix = prefix + fix + postfix;
    return all_fix;
  }

  to_string() {
    return this.name + " " + this.modified;
  }

  get_id_modified(modified) {
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
    const mod2 = modified+" (Local)";
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

  gen_link(){
    var prefix = "https://www.pathofexile.com/trade/search/Settlers?q=";
    var encode = encodeURIComponent(this.search_json);
    var link = prefix + encode;
    this.search_link = link;
  }

  get_total(){
    const body = JSON.stringify(this.search_json);
    const url_api = 'https://www.pathofexile.com/api/trade/search/Settlers';
    chrome.runtime.sendMessage({type: "getTotal", data: body}, function(response) {
      console.log(response);
      this.total = parseInt(response.total);
      this.trade_id = response.id;
    });
    // console.log(response);
  }
}

if(!window.location.href.includes("pobb.in")){
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
              console.log(rarity);
              var item = new Item(name, rarity);
              mutation.target.querySelectorAll("ul li").forEach((ul) => {
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
                    }else{
                      attribute = attribute.replace(value, "#");
                    }
                  });
                  attribute = attribute.replace(/[()]/g, "").trim();
                  attribute = attribute.replace(/#+/g, "#");
                  // console.log(attribute);
                  let result = {
                    attribute: attribute,
                    values: values.map((value) => value.replace("%", "")),
                  };
                  // console.log(result);
                  item.add_modified(result);
                  returnedValues.add(result);
                }
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
    } else {
      start = false;
      observers.forEach((observer) => observer.disconnect());
      observers = [];
      // eqItem.check_total()
      // console.log(eqItem.Array);
      waitCheckTotal(eqItem);
    }
  }
});

async function waitCheckTotal(eqItem){
  await eqItem.check_total();
  console.log(eqItem.Array);
}