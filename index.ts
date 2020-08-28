import { openBrowser } from './utils/fs-utils';

const { assemblyActionData } = require('./template/actionTemplate');
const { assemblyModelHeadCode } = require('./template/modelTemplate');
const { assemblyHomeImportCode } = require('./template/homeTemplate');
const { assemblySearchCode } = require('./template/searchTemplate');
const { assemblyRouter } = require('./template/routerTemplate');

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
  openBrowser();
};

run();
