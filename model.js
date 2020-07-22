import { message } from 'antd';
import cookie from 'js-cookie';
import {
  insertActivityPage,
  deleteMessageListById,
  updateActivityPage,
  queryMessageListByParam,
} from './action';

export default {
  namespace: 'templateList',
  state: {
    list: [],
    pageNo: 1,
    total: 0,
    pageSize: 10,
    searchData: {},
  },
  subscriptions: {},
  effects: {
    * insertActivityPage({ payload }, { call, put, select }) {
      const userInfo = JSON.parse(cookie.get('userInfo'));
      const userId = userInfo.userId || -1;
      const params = {
        ...payload,
        addUserId: userId,
        operateUserId: userId,
      };
      const data = yield call(insertActivityPage, params);
      if (data.code === 1) {
        message.success('添加成功');
        const { pageNo, pageSize, searchData } = yield select((state) => ({
          searchData: state.templateList.searchData,
          pageSize: state.templateList.pageSize,
          pageNo: state.templateList.pageNo,
        }));
        yield put({
          type: 'queryMessageListByParam',
          payload: { pageNo, pageSize, ...searchData },
        });
      }
    },

    * deleteMessageListById({ payload }, { call, put, select }) {
      const data = yield call(deleteMessageListById, { id: payload });
      if (data.code === 1) {
        message.success('删除成功');
        const { pageNo, pageSize, searchData } = yield select((state) => ({
          searchData: state.templateList.searchData,
          pageSize: state.templateList.pageSize,
          pageNo: state.templateList.pageNo,
        }));
        yield put({
          type: 'queryMessageListByParam',
          payload: { pageNo, pageSize, ...searchData },
        });
      }
    },

    * updateActivityPage({ payload }, { call, put, select }) {
      const { addAndUpdateInfo } = yield select((state) => ({
        addAndUpdateInfo: state.templateList.addAndUpdateInfo,
      }));
      const { id } = addAndUpdateInfo;
      const userInfo = JSON.parse(cookie.get('userInfo'));
      const userId = userInfo.userId || -1;
      const params = {
        ...payload,
        operateUserId: userId,
        id,
      };
      const data = yield call(updateActivityPage, params);
      if (data.code === 1) {
        message.success('更新成功');
        yield put({ type: 'queryMessageListByParam' });
      }
    },

    * queryMessageListByParam({ payload }, { call, put, select }) {
      const { searchData, pageSize, pageNo } = yield select((state) => ({
        searchData: state.templateList.searchData,
        pageSize: state.templateList.pageSize,
        pageNo: state.templateList.pageNo,
      }));
      const data = yield call(queryMessageListByParam, {
        ...searchData,
        pageNum: pageNo,
        pageSize,
      });
      if (data.code === 1) {
        const { total, list } = data.obj;
        yield put({ type: 'setState', payload: { total, list } });
      }
    },
  },
};
