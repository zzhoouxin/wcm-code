import { DataJsonType } from '../data/data';

const opn = require('opn');

const fs = require('fs');
// @ts-ignore

const dataJson: DataJsonType = require('../data/data.json');

/**
 * 删除文件夹下面所有文件
 * @param path
 */
export const deleteFolderRecursive = function (path:string) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path) as any;
    files.forEach((file:any) => {
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

export const openBrowser = () => {
  const url = `http://localhost:8000/${dataJson.nameList.fileName}/${dataJson.nameList.pageName}`;
  opn(url);
};

