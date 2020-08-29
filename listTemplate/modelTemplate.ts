import prettier from 'prettier';
import fs from 'fs';
import ora from 'ora';
import { DataJsonType, ActionList } from '../data/data';
// @ts-ignore
import config from '../utils/config';
// @ts-ignore
import { deleteFolderRecursive } from '../utils/fs-utils';

const dataJson: DataJsonType = require('../data/data.json');

const modelSpinner = ora('Model模块代码生成中...').start();

const assemblyModelHeadCode = () => {
  let modelResult = '';
  modelResult = getActionName(); // head
  modelResult += assemblyStateCode(); // state
  modelResult += joiningEffectsCode(); // effects
  modelResult += assemblyReducersCode(); // reducer
  modelResult += '}';
  const modelCode = prettier.format(modelResult, {
    semi: false,
    parser: 'babel',
  });
  writeModelFileCode(modelCode);
};

/**
 * 写入基本文件
 * @param data
 */
const writeModelFileCode = (data:string) => {
  // const actionFile = fs.existsSync(`${config.modelFilePath}${dataJson.nameList.fileName}`);
  deleteFolderRecursive(`${config.modelFilePath}${dataJson.nameList.fileName}`);
  fs.mkdirSync(`${config.modelFilePath}${dataJson.nameList.fileName}`);
  fs.writeFile(`${config.modelFilePath}${dataJson.nameList.fileName}/${dataJson.nameList.modelName}.js`, data, 'utf8', () => {
    modelSpinner.stop();
    modelSpinner.succeed('Model模块代码生成中生成成功!');
  });
};

/**
 * 组装头部的接口代码
 */
const getActionName: actionResType = () => {
  let modelResult = '';
  const allActionName = dataJson.actionList
    .map((action: ActionList) => singleGetActionName(action.name))
    .join(',');
  modelResult += `import { ${allActionName} } from '../../services/${dataJson.nameList.fileName}';`;
  modelResult += 'import { message } from "antd";';
  modelResult += 'import cookie from "js-cookie";';
  return modelResult;
};
/**
 * 组装state代码
 */
const assemblyStateCode: actionResType = () => {
  const stateCode = `
    export default {
        namespace: '${dataJson.nameList.modelName}',
        state: {
          list: [],
          pageNo: 1,
          total: 0,
          pageSize: 10,
          searchData: {},
        },
        subscriptions: {
         
        },
    `;
  return stateCode;
};

/**
 *组装effects代码
 */
const joiningEffectsCode = () => {
  let code = 'effects: {';
  dataJson.actionList.map((action: ActionList) => {
    switch (action.type) {
      case 'query':
        code += assemblyQueryListCode(action);
        break;
      case 'delete':
        code += assemblyDeleteCode(action);
        break;
      // case 'add':
      //   code += assemblyInsertCode(action);
      //   break;
      // case 'edit':
      //   code += assemblyUpdateCode(action);
      //   break;
      default:
        break;
    }
  });
  code += '},';
  return code;
};

const assemblyReducersCode = () => `
  reducers: {
    setState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    }
  }`;

/**
 * 组装查询list的代码
 * @param action
 */
const assemblyQueryListCode = (action: ActionList) => {
  const queryName = singleGetActionName(action.name);
  const code = `
    * ${queryName}({ payload }, { call, put, select }){
          const { searchData, pageSize, pageNo } = yield select(state => ({
            searchData: state.${dataJson.nameList.modelName}.searchData,
            pageSize: state.${dataJson.nameList.modelName}.pageSize,
            pageNo: state.${dataJson.nameList.modelName}.pageNo,
          }));
          const data = yield call(${queryName}, { ...searchData, pageNo, pageSize });
          if (data.code === 1) {
            const { total, list } = data.obj;
            yield put({ type: 'setState', payload: { total, list } });
          }
    },
    `;
  return code;
};

/**
 * 组装查询删除的代码
 * @param action
 */
const assemblyDeleteCode = (action: ActionList) => {
  const deleteName = singleGetActionName(action.name);
  const findQueryName = findQuertActionName();
  const queryName = singleGetActionName(findQueryName);
  const code = `
      * ${deleteName}({ payload }, { call, put, select }){
        const data = yield call(${deleteName}, { id: payload });
        if (data.code === 1) {
            message.success('删除成功');
            yield put({ type: '${queryName}'});
        }
      },
      `;
  return code;
};

/**
 * 组装添加代码
 * @param action
 */
const assemblyInsertCode = (action: ActionList) => {
  const insertName = singleGetActionName(action.name);
  const findQueryName = findQuertActionName();
  const queryName = singleGetActionName(findQueryName);
  const code = `
    * ${insertName}({ payload }, { call, put, select }){
        const userInfo = JSON.parse(cookie.get('userInfo'));
        const userId = userInfo.userId || -1;
        const params = {
            ...payload,
            addUserId: userId,
            operateUserId: userId,
        };
      const data = yield call(${insertName}, params);
      if (data.code === 1) {
          message.success('添加成功');
          const { pageNo, pageSize, searchData } = yield select(state => ({
              searchData: state.templateList.searchData,
              pageSize: state.templateList.pageSize,
              pageNo: state.templateList.pageNo,
          }));
          yield put({ type: '${queryName}', payload: { pageNo, pageSize, ...searchData } });
      }
    },
    `;
  return code;
};
/**
 * 组装更新代码
 * @param action
 */
const assemblyUpdateCode = (action: ActionList) => {
  const updatetName = singleGetActionName(action.name);
  const findQueryName = findQuertActionName();
  const queryName = singleGetActionName(findQueryName);
  const code = `
      * ${updatetName}({ payload }, { call, put, select }){
        const { addAndUpdateInfo } = yield select(state => ({
            addAndUpdateInfo: state.${dataJson.nameList.modelName}.addAndUpdateInfo,
          }));
          const { id } = addAndUpdateInfo;
          const userInfo = JSON.parse(cookie.get('userInfo'));
          const userId = userInfo.userId || -1;
          const params = {
            ...payload,
            operateUserId: userId,
            id,
          };
          const data = yield call(${updatetName}, params);
          if (data.code === 1) {
            message.success('更新成功');
            yield put({ type: '${queryName}' });
          }
      },
      `;
  return code;
};

/**
 * 单独获取查询接口名称
 */
const findQuertActionName = (findTyle:string = 'query') => {
  const findActionName = dataJson.actionList.find(
    (_action: ActionList) => _action.type === findTyle,
  )?.name || '';
  return findActionName;
};

/**
 * 单独获取接口名称
 */
const singleGetActionName = (actionName: string) => {
  const splitData = actionName.split('/');
  const interfaceIndex = splitData.length - 1;
  return splitData[interfaceIndex];
};

module.exports = {
  assemblyModelHeadCode,
  findQuertActionName,
  singleGetActionName,

};

type actionResType = () => string;
type Nil = null | undefined;
type MayBeNil<T> = Nil | T;
