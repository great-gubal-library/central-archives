import errors from '@app/shared/errors';
import axios, { AxiosInstance } from 'axios';
import { boot } from 'quasar/wrappers';
import API from '@common/common/api';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: API;
  }
}

const api = new API();

export function useApi() {
  return api;
}

export default boot(async ({ app, store }) => {
  app.config.globalProperties.$axios = axios;

  app.config.globalProperties.$api = api;

  if (api.hasAccessToken()) {
    try {
      const sessionResponse = await api.user.getSession();
      api.maybeUpdateAccessToken(sessionResponse.newAccessToken);
      store.commit('setUser', sessionResponse.session);
    } catch (e) {
      console.log(errors.getMessage(e));
    }
  }
});
