class equidItem {
  constructor() {
    this.Array = [];
  }

  add_item(item) {
    item.gen_json();
    this.Array.push(item);
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
}

class Item {
  constructor(name, rare) {
    this.rare = rare;
    this.name = name;
    this.baseName = name.split(",")[1];
    this.modified = [];
    this.search_json = "";
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
    var prefix = `{"query": {"type": "`+ this.baseName +`","stats": [`;
    var postfix = `]},"status": {"option": "any"}}`;
    var fix = "";
    var i = 0;
    for (let stat of modified){
      i++;
      if(stat.ids.length == 0) continue;
      var add_fix = this.gen_stat(stat.ids, stat.values);
      if(i < modified.length) add_fix += ",";
      fix += add_fix;
    }
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
    const json = JSON.parse(localStorage.getItem("data"));
    // console.log(modified);
    // const regex = new RegExp(modified.replace(/#/g, "(\\d+|#)"), "g");
    const regex = new RegExp(
      modified
        .replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
        .replace(/#/g, "(\\d+|#)"),
      "g"
    );
    const regexPerfect = new RegExp(
      "^" +
        modified
          .replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
          .replace(/#/g, "(\\d+|#)") +
        "$"
    );

    var filteredEntries = [];
    // console.log(modified)
    // console.log(regex);
    var much = false;
    json.result.forEach((result) => {
      result.entries.forEach((entry) => {
        if (
          entry.text.match(regex) &&
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
    return filteredEntries;
  }
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
                  values.forEach((value, index) => {
                    // attribute = attribute.replace(/([+\-]?\d+(\.\d+)?%?)|(\(\d+-\d+\)%?)/g, '').trim();
                    // attribute = attribute.replace(/^\+/g, '');
                    attribute = attribute.replace(value, "#");
                  });
                  attribute = attribute.replace(/[()]/g, "").trim();
                  attribute = attribute.replace(/#+/g, "#");
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
      console.log(eqItem.Array);
    }
  }
});
