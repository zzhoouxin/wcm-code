import fs from 'fs';
import ora from 'ora';

import { DataJsonType } from '../data/data';
// @ts-ignore
import config from '../utils/config';

const routerSpinner = ora('新增模块router代码生成中...').start();

const dataJson: DataJsonType = require('../data/data.json');

/**
 * 修改动态路由地址
 */

const assemblyCreateRouter = () => {
  const routerData = fs.readFileSync(`${config.projectPath}/src/router.js`, 'utf-8').split(/\r\n|\n|\r/gm);
  routerData.splice(routerData.length - 23, 0, `{
          path: '${dataJson.createPageData.fileName}/${dataJson.createPageData.pageName}',
          name: '${dataJson.nameList.fileName}',
          getComponent(nextState, cb) {
            require.ensure([], require => {
               registerModel(app, require('./models/${dataJson.createPageData.fileName}/${dataJson.createPageData.modelName}'))
              cb(null, require('./routes/${dataJson.createPageData.fileName}/${dataJson.createPageData.pageName}'));
            })
          }
        },`);
  fs.writeFileSync(`${config.projectPath}/src/router.js`, routerData.join('\r\n'));
  routerSpinner.stop();
  routerSpinner.succeed('新增模块router生成成功!');
};

module.exports = {
  assemblyCreateRouter,
};
