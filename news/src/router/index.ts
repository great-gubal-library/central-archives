import { route } from 'quasar/wrappers';
import { nextTick } from 'vue';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  Router
} from 'vue-router';
import { StateInterface } from '../store';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

let router: Router;

export default route<StateInterface>(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  router = createRouter({
    scrollBehavior: (_, __, savedPosition) => savedPosition || { left: 0, top: 0 },
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE
    ),
  });

  router.afterEach((to) => {
    let title = to.meta.title;

    if (typeof title === 'function') {
      title = title(to);
    }

    if (typeof title === 'string') {
      const titleString = title;

      // nextTick is necessary here to properly record browser history
      void nextTick(() => {
        document.title = (titleString ? `${titleString} — ` : '') + 'The Harborwatch';
      });
    }
  });

  return router;
});

export function useRouter() {
  return router;
}
