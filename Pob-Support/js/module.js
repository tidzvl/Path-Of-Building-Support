export class equidItem {
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

export class Item {
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


// export {Item, equidItem};