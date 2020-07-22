const { assemblyActionData } = require('./template/actionTemplate');
const { assemblyModelHeadCode } = require('./template/modelTemplate');
const { assemblyHomeImportCode } = require('./template/homeTemplate');

async function run() {
// 生成action
  assemblyActionData();
  // 生成model
  assemblyModelHeadCode();
  // 生成页面
  assemblyHomeImportCode();
}

run();
