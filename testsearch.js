class equidItem {
  constructor() {
    this.Array = [];
  }

  add_item(item) {
    this.Array.push(item);
  }
  check_containts(item){
    var str = item.to_string();
    for(var i = 0; i < this.Array.length; i++){
      if(this.Array[i].to_string() == str){
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
    this.modified.push(modified);
  }
  to_string() {
    return this.name + " " + this.modified;
  }
}

const targetNodes = document.querySelectorAll(
  "div.absolute.z-30.pointer-events-none.hidden.overflow-hidden"
);

const config = { attributes: true, childList: true, subtree: true };

const returnedValues = new Set();

let observers = [];

let currentItemContent = "";

const eqItem = new equidItem();

const callback = function (mutationsList, observer) {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList" || mutation.type === "attributes") {
      const itemContent = Array.from(mutation.target.querySelectorAll("div"))
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
          //   console.log(divText);
          name += divText + " ";
          returnedValues.add(divText);
        }
      });
      if (name != "") {
        // console.log(name);
        var item = new Item(name);
        mutation.target.querySelectorAll("ul li").forEach((ul) => {
          if (!returnedValues.has(ul.textContent)) {
            //   console.log(ul.textContent);
            item.add_modified(ul.textContent);
            returnedValues.add(ul.textContent);
          }
        });
        if(!eqItem.check_containts(item)){
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

// observer.disconnect();

//list of strat: https://www.pathofexile.com/api/trade/data/stats
//list of item: https://www.pathofexile.com/api/trade/data/items
