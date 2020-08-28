import fs from 'fs';
import ora from 'ora';

import { DataJsonType } from '../data/data';
// @ts-ignore
import config from '../utils/config';

const routerSpinner = ora('router模块代码生成中...').start();

const dataJson: DataJsonType = require('../data/data.json');

/**
 * 修改动态路由地址
 */

const assemblyRouter = () => {
  const routerData = fs.readFileSync('/Users/admin/AiJia/wcm-front/src/router.js', 'utf-8').split(/\r\n|\n|\r/gm);
  routerData.splice(routerData.length - 23, 0, `{
          path: '${dataJson.nameList.fileName}/${dataJson.nameList.pageName}',
          name: '${dataJson.nameList.fileName}',
          getComponent(nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/${dataJson.nameList.fileName}/${dataJson.nameList.modelName}'))
              cb(null, require('./routes/${dataJson.nameList.fileName}/${dataJson.nameList.pageName}'));
            })
          }
        },`);
  fs.writeFileSync('/Users/admin/AiJia/wcm-front/src/router.js', routerData.join('\r\n'));
  routerSpinner.stop();
  routerSpinner.succeed('router模块代码生成中生成成功!');
};

module.exports = {
  assemblyRouter,
};
