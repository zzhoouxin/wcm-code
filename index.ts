// const { assemblyActionData } = require('./template/actionTemplate');
// const { assemblyModelHeadCode } = require('./template/modelTemplate');
// const { assemblyHomeImportCode } = require('./template/homeTemplate');
const { assemblySearchCode } = require('./template/searchTemplate');

async function run() {
// // 生成action
//   assemblyActionData();
//   // 生成model
//   assemblyModelHeadCode();
//   // 生成页面
//   assemblyHomeImportCode();
  // 生成搜索页面
  assemblySearchCode();
}

run();
