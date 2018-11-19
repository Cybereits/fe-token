import { queryNotices } from '../services/api';

export default {
  namespace: 'global',

  state: {
    collapsed: true,
    notices: [],
    tokenBalanceOverviewList: [],
    serverStateInfoList: [],
  },

  effects: {
    *fetchNotices(_, { call, put }) {
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      yield put({
        type: 'user/changeNotifyCount',
        payload: data.length,
      });
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: 'user/changeNotifyCount',
        payload: count,
      });
    },
    *updateServerState({ status }, { put }) {
      yield put({
        type: 'saveServerState',
        status,
      })
    },
    *updateTokenBalance({ balances }, { put }) {
      yield put({
        type: 'saveTokenBalanceOverview',
        balances,
      })
    },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
    saveServerState(state, { status }) {
      const oldList = state.serverStateInfoList

      if (status) {
        const newState = {}

        oldList.forEach(item => {
          newState[item.uri] = item
        })

        newState[status.uri] = status

        return {
          ...state,
          serverStateInfoList: Object.values(newState),
        }
      } else {
        return state
      }

    },
    saveTokenBalanceOverview(state, { balances }) {
      return {
        ...state,
        tokenBalanceOverviewList: balances,
      };
    },
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
