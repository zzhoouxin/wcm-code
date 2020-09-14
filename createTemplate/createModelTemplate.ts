import prettier from 'prettier';
import fs from 'fs';
import ora from 'ora';
import { DataJsonType, FormList, Search } from '../data/data';
import { deleteFolderRecursive } from '../utils/fs-utils';
// @ts-ignore
import config from '../utils/config';

const dataJson: DataJsonType = require('../data/data.json');

let createSpinner = null as any;

const { findQueryActionName, singleGetActionName } = require('../listTemplate/modelTemplate');

const updateName = singleGetActionName(findQueryActionName('add'));
const assemblyCreateModeCode = () => {
  createSpinner = ora('新增模块model代码生成中...').start();
  let initValue = '';
  dataJson.createPageData.formList.map((item) => {
    if (item.initialValue) {
      initValue += `${item.key}:"${item.initialValue}",`;
    }
  });
  let createModelResult = `
   import { message } from 'antd';
   import { routerRedux } from 'dva/router';
   import { ${updateName} } from '../../services/project';
   export default {
    namespace: '${dataJson.createPageData.modelName}',
    state:{
     isEdit: false, // 是否修改
      addAndUpdateInfo: {
      ${initValue}
      },
    },
    `;

  createModelResult += generateEffects();
  createModelResult += generateReducers();
  createModelResult += '}';

  const data = prettier.format(createModelResult, {
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
  const insertFile = fs.existsSync(`${config.projectPath}/src/models/${dataJson.createPageData.fileName}`);
  if (!insertFile) {
    fs.mkdirSync(`${config.projectPath}/src/models/${dataJson.createPageData.fileName}`);
  }
  fs.writeFile(`${config.projectPath}/src/models/${dataJson.createPageData.fileName}/${dataJson.createPageData.modelName}.js`, data, 'utf8', () => {
    console.log('在这边嘛');
    createSpinner.stop();
    createSpinner.succeed('新增模块model生成生成成功!');
  });
};

const generateEffects = () => {
  const effectsCode = `
      effects: {
    * ${updateName}({ payload }, { call, put, select }) {
      const { code, ext } = yield call(${updateName}, { ...payload });
      if (code === 1) {
        message.success('创建成功!');
        yield put(routerRedux.push({ pathname: '/${dataJson.nameList.fileName}/${dataJson.nameList.pageName}' }));
      } else {
        message.error(ext && ext.msg);
      }
    }
    },
    `;
  return effectsCode;
};

/**
 * 渲染底部reducers代码
 */
const generateReducers = () => {
  const reducersCode = ` reducers: {
    setState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    cleanData(state) {
      return {
        ...state,
        addAndUpdateInfo: {
        },
        isEdit: false,
      };
    },

  },`;
  return reducersCode;
};

module.exports = {
  assemblyCreateModeCode,
};
