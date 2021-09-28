import errors from '@app/shared/errors';
import axios, { AxiosInstance } from 'axios';
import { boot } from 'quasar/wrappers';
import API from 'src/common/api';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: API;
  }
}

export default boot(async ({ app, store }) => {
  app.config.globalProperties.$axios = axios;

  const api = new API();
  app.config.globalProperties.$api = api;

  if (api.hasAccessToken()) {
    try {
      const session = await api.user.getSession();
      store.commit('setUser', session);
    } catch (e) {
      console.log(errors.getMessage(e));
    }
  }
});
