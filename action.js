import { request } from '../../utils';

/**
 * 创建活动模板
 */
export const insertActivityPage = (params) => request('/api/activityPage/insertActivityPage', {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
  body: JSON.stringify(params),
});

/**
 * 查询活动列列表
 */
export const deleteMessageListById = (params) => request('/api/activityPage/deleteMessageListById', {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
  body: JSON.stringify(params),
});

/**
 * 编辑活动模板
 */
export const updateActivityPage = (params) => request('/api/activityPage/updateActivityPage', {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
  body: JSON.stringify(params),
});

/**
 * 查询活动列列表
 */
export const queryMessageListByParam = (params) => request('/api/activityPage/queryMessageListByParam', {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
  body: JSON.stringify(params),
});
