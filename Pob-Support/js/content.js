class equidItem {
  constructor() {
    this.Array = [];
  }

  add_item(item) {
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
  constructor(name) {
    this.name = name;
    this.modified = [];
  }

  add_modified(modified) {
    modified = String(modified);
    this.get_id_modified(modified).then(item => {
      if (item) {
        console.log(item);
        this.modified.push(modified, item);
      }
    }).catch(error => {
      console.error(error);
      this.modified.push(modified);
    });
  }

  to_string() {
    return this.name + " " + this.modified;
  }

  get_id_modified(modified) {
  return fetch(chrome.runtime.getURL('json/stat.json'))
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const entries = data.result.flatMap((entry) => entry.entries);
      return this.fuzzySearch(modified, entries);
    })
    .catch(error => {
      console.error('Fetch error:', error);
      return null;
    });
}

  fuzzySearch(query, data) {
  const results = [];
  query = query.toLowerCase().replace(/#/, "\\d+");
  const queryRegex = new RegExp(query);

  if (Array.isArray(data)) {
    data.forEach((item) => {
      const text = item.text.toLowerCase();
      if (queryRegex.test(text)) {
        results.push(item);
      }
    });
  }

  return results.length > 0 ? results[0] : null;
}

similarityScore(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0 || j === 0) {
        dp[i][j] = 0;
      } else if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n] / Math.max(m, n);
}
}

console.log("Start");
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
                name += divText + " ";
                returnedValues.add(divText);
              }
            });
            if (name != "") {
              var item = new Item(name);
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
