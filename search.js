class Item {
  constructor(name) {
    this.name = name;
    this.modified = [];
  }

  add_modified(modified) {
    this.get_id_modified(modified)
      .then((item) => {
        if (item) {
          console.log(item);
        }
      })
      .catch((error) => {
        console.error(error);
      });
    this.modified.push(modified);
  }

  to_string() {
    return this.name + " " + this.modified;
  }

  get_id_modified(modified) {
    const filePath = 'file:///E:/AutoPoe/Path-Of-Building-Support/Pob-Support/json/stat.json';
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', filePath, true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          const jsonData = JSON.parse(xhr.responseText);
          resolve(this.fuzzySearch(modified, jsonData.result.flatMap((entry) => entry.entries)));
        } else {
          reject(new Error('Failed to load file'));
        }
      };
      xhr.send();
    });
  }

  fuzzySearch(query, data) {
    const results = [];
    query = query.toLowerCase().replace(/#/, "\\d+");
    const queryRegex = new RegExp(query);

    data.forEach((item) => {
      const text = item.text.toLowerCase();
      if (queryRegex.test(text)) {
        results.push(item);
      }
    });

    return results.length > 0 ? results[0] : null;
  }
}

const item = new Item("Example Item");
item.add_modified("Trigger Level \\d+ Feast of Flesh every \\d+ seconds");
