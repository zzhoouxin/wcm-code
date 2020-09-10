import { openBrowser } from './utils/fs-utils';

const { assemblyActionData } = require('./listTemplate/actionTemplate');
const { assemblyModelHeadCode } = require('./listTemplate/modelTemplate');
const { assemblyHomeImportCode } = require('./listTemplate/homeTemplate');
const { assemblySearchCode } = require('./listTemplate/searchTemplate');
const { assemblyRouter } = require('./listTemplate/routerTemplate');
//创建
const { assemblyCreateHomeCode } = require('./createTemplate/createTemplate');
const { assemblyCreateRouter } = require('./createTemplate/routerTemplate');

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
  // 生成创建页面
  assemblyCreateHomeCode();

  assemblyCreateRouter();

  openBrowser();
};

run();
