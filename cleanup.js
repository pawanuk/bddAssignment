const fs = require('fs-extra');
const path = require('path');

const directories = ['screenshots', 'videos'];

directories.forEach(dir => {
  const directory = path.join(__dirname, dir);

  try {
    fs.emptyDirSync(directory);
    console.log(`Successfully deleted contents of ${dir} directory.`);
  } catch (err) {
    if (err.code === 'EBUSY') {
      console.warn(`Warning: ${dir} directory is busy or locked. Skipping deletion.`);
    } else {
      console.error(`Error deleting contents of ${dir} directory:`, err);
    }
  }
});

console.log('Cleanup process completed.');
