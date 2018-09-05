import moment from 'moment';
import {
  queryBatchTransactionTasks,
  queryTxRecordsViaTaskId,
  sendTransactionfFromIds,
  sendTransactionfFromTaskid,
  createBatchTransactions,
  tokenTypeEnum,
  gatherAllTokens,
} from '../services/api';

export default {
  namespace: 'coinTask',

  state: {
    tokenTypeEnum: [],
    queryBatchTransactionTasks: {
      list: [],
      pagination: {},
    },
    queryTxOperationRecords: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *tokenTypeEnum({ payload }, { call, put }) {
      const response = yield call(tokenTypeEnum, payload);
      if (response) {
        yield put({
          type: 'getTaskData',
          tokenTypeEnum: response.data.tokenTypeEnum,
        });
      }
    },
    *createBatchTransactions({ params, callback }, { call }) {
      const newParams = {
        transaction: [],
        comment: params.comment,
      };
      params.transaction.forEach(item => {
        const obj = { ...item };
        delete obj.key;
        newParams.transaction.push({
          ...obj,
        });
      });
      const response = yield call(createBatchTransactions, newParams);
      callback(response);
    },
    *gatherAllTokens({ params, callback }, { call }) {
      const response = yield call(gatherAllTokens, params);
      callback(response);
    },
    *sendTransactionfFromTaskid({ params, callback }, { call }) {
      const response = yield call(sendTransactionfFromTaskid, params);
      callback(response);
      // if (response) {
      //   yield put({
      //     type: 'getTaskData',
      //     queryBatchTransactionTasks: response.data.queryBatchTransactionTasks,
      //   });
      // }
    },
    *sendTransactionfFromIds({ params, callback }, { call }) {
      const response = yield call(sendTransactionfFromIds, params);
      callback(response);
      // if (response) {
      //   yield put({
      //     type: 'getTaskData',
      //     queryBatchTransactionTasks: response.data.queryBatchTransactionTasks,
      //   });
      // }
    },
    *queryBatchTransactionTasks(
      {
        params = {
          pageIndex: 1,
          pageSize: 10,
        },
      },
      { call, put }
    ) {
      const response = yield call(queryBatchTransactionTasks, params);
      if (response) {
        const newqueryBatchTransactionTasks = {};
        newqueryBatchTransactionTasks.list = response.data.queryBatchTransactionTasks.list.map(
          (item, index) => {
            return {
              ...item,
              createAt: item.createAt === '' || moment(item.createAt).format('YYYY-MM-DD HH:mm:ss'),
              key: index,
            };
          }
        );
        newqueryBatchTransactionTasks.pagination =
          response.data.queryBatchTransactionTasks.pagination;
        yield put({
          type: 'getTaskData',
          queryBatchTransactionTasks: newqueryBatchTransactionTasks,
        });
      }
    },
    *queryTxOperationRecords(
      {
        params = {
          pageIndex: 1,
          pageSize: 10,
        },
      },
      { call, put }
    ) {
      const response = yield call(queryTxRecordsViaTaskId, params);
      if (response) {
        const newQueryTxRecordsViaTaskId = {};
        newQueryTxRecordsViaTaskId.list = response.data.queryTxRecordsViaTaskId.list.map(
          (item, index) => {
            return {
              ...item,
              confirmTime:
                item.confirmTime === '' || moment(item.confirmTime).format('YYYY-MM-DD HH:mm:ss'),
              sendTime: item.sendTime === '' || moment(item.sendTime).format('YYYY-MM-DD HH:mm:ss'),
              key: index,
            };
          }
        );
        newQueryTxRecordsViaTaskId.pagination = response.data.queryTxRecordsViaTaskId.pagination;
        yield put({
          type: 'getTaskData',
          queryTxOperationRecords: newQueryTxRecordsViaTaskId,
        });
      }
    },
  },

  reducers: {
    getTaskData(state, action) {
      return {
        ...state,
        tokenTypeEnum: action.tokenTypeEnum || state.tokenTypeEnum,
        queryBatchTransactionTasks:
          action.queryBatchTransactionTasks || state.queryBatchTransactionTasks,
        queryTxOperationRecords: action.queryTxOperationRecords || state.queryTxOperationRecords,
      };
    },
  },
};
