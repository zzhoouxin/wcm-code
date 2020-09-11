import { openBrowser } from './utils/fs-utils';
import { DataJsonType } from './data/data';

const { assemblyActionData } = require('./listTemplate/actionTemplate');
const { assemblyModelHeadCode } = require('./listTemplate/modelTemplate');
const { assemblyHomeImportCode } = require('./listTemplate/homeTemplate');
const { assemblySearchCode } = require('./listTemplate/searchTemplate');
const { assemblyRouter } = require('./listTemplate/routerTemplate');
// 创建
const { assemblyCreateHomeCode } = require('./createTemplate/createTemplate');
const { assemblyCreateRouter } = require('./createTemplate/routerTemplate');
const { assemblyCreateModeCode } = require('./createTemplate/createModelTemplate');

const dataJson: DataJsonType = require('./data/data.json');

const run = () => {
  // // 生成页面
  assemblyHomeImportCode();
  // 生成action
  assemblyActionData();
  // 生成model
  assemblyModelHeadCode();
  //  生成搜索页面
  assemblySearchCode();
  // 修改路由
  assemblyRouter();
  if (dataJson.openPage) {
    // 生成创建页面
    assemblyCreateHomeCode();
    assemblyCreateRouter();
    assemblyCreateModeCode();
  }

  openBrowser();
};

run();
