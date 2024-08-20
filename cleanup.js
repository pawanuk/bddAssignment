const fs = require('fs-extra');
const path = require('path');

const directories = ['screenshots', 'videos'];

directories.forEach(dir => {
  const directory = path.join(__dirname, dir);
  fs.emptyDirSync(directory);
});

console.log('Old screenshots and videos have been deleted.');
