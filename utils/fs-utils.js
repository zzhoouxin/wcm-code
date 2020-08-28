const fs = require('fs');

const deleteFolderRecursive = function (path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file, index) => {
      const curPath = `${path}/${file}`;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        // eslint-disable-next-line no-undef
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

module.exports = {
  deleteFolderRecursive,
};
