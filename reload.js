const fs = require('fs');
const path = require('path');

const extensionDir = path.resolve(__dirname, 'Pob-Support');
const extensionId = 'bljbpjndfjpefoeljinfhbjcjpkocpgm'; 

fs.watch(extensionDir, { recursive: true }, (eventType, filename) => {
  if (filename) {
    console.log(`File changed: ${filename}`);
    reloadExtension();
  }
});

function reloadExtension() {
  const exec = require('child_process').exec;
  exec(`chrome-cli reload -e ${extensionId}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error reloading extension: ${error}`);
      return;
    }
    console.log('Extension reloaded successfully.');
  });
}
