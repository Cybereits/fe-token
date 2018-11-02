import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach(model => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    '/wallet/wallet-list': {
      component: dynamicWrapper(app, ['wallet'], () => import('../routes/Wallet/WalletList')),
    },
    '/coin/coin-send': {
      component: dynamicWrapper(app, ['coin'], () => import('../routes/Coin/CoinSend')),
    },
    '/coin/coin-overview': {
      component: dynamicWrapper(app, ['coin'], () => import('../routes/Coin/CoinOverview')),
    },
    '/coin/coin-createTask/:addressList': {
      component: dynamicWrapper(app, ['coinTask'], () => import('../routes/Coin/CreateTask')),
    },
    '/coin/coin-createTask/': {
      component: dynamicWrapper(app, ['coinTask'], () => import('../routes/Coin/CreateTask')),
    },
    '/coin/coin-gather/': {
      component: dynamicWrapper(app, ['coinTask'], () => import('../routes/Coin/CoinGather')),
    },
    '/coin/coin-overview/taskList': {
      component: dynamicWrapper(app, ['coinTask'], () => import('../routes/Coin/CoinTaskList')),
    },
    '/coin/coin-overview/taskDetail/:taskid': {
      component: dynamicWrapper(app, ['coinTask'], () => import('../routes/Coin/CoinTaskDetail')),
    },
    '/user/user-createUser': {
      component: dynamicWrapper(app, ['user'], () => import('../routes/User/CreateUser')),
    },
    '/user/user-changePwd': {
      component: dynamicWrapper(app, ['user'], () => import('../routes/User/ChangePwd')),
    },
    '/user/user-list': {
      component: dynamicWrapper(app, ['user'], () => import('../routes/User/UserList')),
    },
    '/security/security-list': {
      component: dynamicWrapper(app, ['security'], () => import('../routes/Security/SecurityList')),
    },
    '/contract/contract-search': {
      component: dynamicWrapper(app, ['contract'], () =>
        import('../routes/Contract/SearchContract')
      ),
    },
    '/contract/contract-abis/:params': {
      component: dynamicWrapper(app, ['contract'], () => import('../routes/Contract/ContractAbis')),
    },
    '/contract/contract-create': {
      component: dynamicWrapper(app, ['contract'], () =>
        import('../routes/Contract/CreateContract')
      ),
    },
    '/contract/contract-add': {
      component: dynamicWrapper(app, ['contract'], () => import('../routes/Contract/AddContract')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () =>
        import('../routes/Exception/triggerException')
      ),
    },
    '/entry': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/entry/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    '/entry/forgetPwd': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/ForgetPwd')),
    },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];

    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
