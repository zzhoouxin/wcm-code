import prettier from 'prettier';
import fs from 'fs';
import ora from 'ora';
import { DataJsonType } from '../data/data';
// @ts-ignore
import config from '../utils/config';

const actionSpinner = ora('Action模块代码生成中...').start();

const dataJson: DataJsonType = require('../data/data.json');
/**
 * 组装action数据
 */

const assemblyActionData = () => {
  let interfaceResult = 'import { request } from "../../utils";';
  dataJson.actionList.map((action: InterfaceObj) => {
    const splitData = action.name.split('/');
    const interfaceIndex = splitData.length - 1;
    interfaceResult += `\n 
          /**
           * ${action.desc}
           */
          export const ${splitData[interfaceIndex]} =(params) =>{
              return request('/api/${action.name}', {
                  headers: { 'Content-Type': 'application/json' },
                  method: 'POST',
                  body: JSON.stringify(params),
                })
          };`;
  });
  const data = prettier.format(interfaceResult, {
    semi: false,
    parser: 'babel',
  });
  writeServiceFileCode(data);
};

/**
 * 写入基本文件
 * @param data
 */
const writeServiceFileCode = (data:string) => {
  const actionFile = fs.existsSync(`${config.projectPath}/src/services/${dataJson.nameList.fileName}`);
  if (actionFile) {
  } else {
    fs.mkdirSync(`${config.projectPath}/src/services/${dataJson.nameList.fileName}`);
  }
  fs.writeFile(`${config.projectPath}/src/services/${dataJson.nameList.fileName}/index.js`, data, 'utf8', () => {
    actionSpinner.stop();
    actionSpinner.succeed('Action模块代码生成中生成成功!');
  });
};

module.exports = {
  assemblyActionData,
};

interface InterfaceObj {
    name: string;
    desc: string;
    type: string
}
