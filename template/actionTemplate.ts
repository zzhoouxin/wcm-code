import prettier from 'prettier';
import fs from 'fs';
import ora from 'ora';
import { DataJsonType } from '../data/data';

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
  fs.writeFile('Page/action.js', data, 'utf8', () => {
    setTimeout(() => {
      actionSpinner.stop();
      actionSpinner.succeed('Action模块代码生成中生成成功!');
    }, 2000);
  });
};

module.exports = {
  assemblyActionData,
};
interface InterfaceObj {
  name: string;
  desc: string;
  type:string
}
