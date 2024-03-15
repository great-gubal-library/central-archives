<template>
  <q-page>
    <h2>Log In</h2>
    <q-form class="page-login__form" @submit="onSubmit">
      <p>Please fill in the form below to log in to {{ ssoParams.name }}<template v-if="ssoParams.host"> using your {{$siteName}} account</template>.</p>
      <p>If you previously registered on Chaos Archives or Crystal Archives, use that account to log in.</p>
      <section>
        <q-input
          v-model="email"
          label="Email"
          :rules="[$rules.required('This field is required.'), $rules.email('Invalid email address.')]"
        >
          <template v-slot:prepend>
            <q-icon name="mail" />
          </template>
        </q-input>
        <q-input
          v-model="password"
          label="Password"
          type="password"
          :rules="[$rules.required('This field is required.')]"
        >
          <template v-slot:prepend>
            <q-icon name="password" />
          </template>
        </q-input>
        <q-slide-transition>
          <section v-if="showOtp">
            <q-input
              v-model="otp"
              label="One-time password or backup code"
              :rules="[$rules.required('This field is required.'), (val) => isValidOtp(val)]"
            >
              <template v-slot:prepend>
                <q-icon name="pin" />
              </template>
            </q-input>
            <div class="text-caption">
              Your account is protected by two-factor authentication. Please input a one-time password from your
              authenticator (six digits), or your backup code if you lost your authenticator.
            </div>
          </section>
        </q-slide-transition>
      </section>
      <p class="page-login__forgot-password">
        <router-link :to="`/forgot-password/${email}`">Forgot your password?</router-link>
      </p>
      <div class="page-login__button-bar">
        <q-btn label="Log in" type="submit" color="primary" />
      </div>
      <q-inner-loading :showing="loading" />
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { notifyError, notifySuccess } from 'src/common/notify';
import SharedConstants from '@app/shared/SharedConstants';
import errors from '@app/shared/errors';
import { hsspRedirectToOrigin } from '../common/hssp';
import { useRouter } from '../router';
import { RouteLocationNormalized } from 'vue-router';
import { useStore } from '../store';
import { useRegionConfig } from '../boot/region';

interface SsoParams {
  host: string | null;
  name: string;
  redirectPath: string;
  needLoginForm: boolean;
}

const HOST_REGEX = /^([a-z.]+[a-z]+)(?::[0-9]+)?$/;
const $router = useRouter();

function parseQuery(to: RouteLocationNormalized): SsoParams {
  const redirectPath = to.query.redirect as string || '/';

  if (!redirectPath.startsWith('/')) {
    throw new Error('Invalid redirect path');
  }

  const needLoginForm = !useStore().getters.role;
  const host = to.query.host as string;

  if (!host) {
    // Same-site login
    return {
      host: null,
      redirectPath,
      needLoginForm,
      name: useRegionConfig().name,
    };
  }

  // Cross-site login
  const match = host.match(HOST_REGEX);

  if (!match) {
    throw new Error('Invalid host');
  }

  const hostname = match[1];

  for (let regionConfig of Object.values(SharedConstants.regions)) {
    if (hostname.endsWith(regionConfig.domain)) {
      return {
        host,
        redirectPath,
        needLoginForm,
        name: regionConfig.name,
      };
    }

    if (regionConfig.newsDomain && hostname.endsWith(regionConfig.newsDomain)) {
      return {
        host,
        redirectPath,
        needLoginForm,
        name: regionConfig.newsName!,
      };
    }
  }

  throw new Error('Unknown host');
}

function ssoRedirect(params: SsoParams) {
  hsspRedirectToOrigin(`${window.location.protocol}//${params.host}`, params.redirectPath);
}

@Options({
  name: 'PageIndex',
  beforeRouteEnter(to, _, next) {
    const ssoParams = parseQuery(to);

    if (!ssoParams.needLoginForm) {
      if (ssoParams.host) {
        ssoRedirect(ssoParams);
      } else {
        notifySuccess('You are already logged in.');
        void $router.replace(ssoParams.redirectPath);
      }

      return false;
    }

    next((vm) => (vm as PageLogIn).ssoParams = ssoParams);
  }
})
export default class PageLogIn extends Vue {
  ssoParams: SsoParams = {
    host: null,
    name: '',
    redirectPath: '/',
    needLoginForm: true,
  };
  email = '';
  password = '';
  otp = '';

  showOtp = false;
  loading = false;

  isValidOtp(otp: string): string | boolean {
    if (!otp) {
      return true;
    }

    if (SharedConstants.OTP_REGEX.test(otp) || SharedConstants.CLIENT_BACKUP_CODE_REGEX.test(otp)) {
      return true;
    }

    return 'Invalid one-time password or backup code';
  }

  async onSubmit() {
    this.loading = true;

    try {
      const result = await this.$api.user.logIn({
        email: this.email,
        password: this.password,
        otp: this.otp || null,
      });

      this.$api.setAccessToken(result.accessToken);
      this.$store.commit('setUser', result.session);

      if (this.ssoParams.host) {
        // Cross-site login - redirect back
        ssoRedirect(this.ssoParams);
        return;
      }

      notifySuccess('You have successfully logged in.');
      void this.$router.replace(this.ssoParams.redirectPath);
    } catch (e) {
      if (errors.getStatusCode(e) === 400 && errors.getMessage(e) === SharedConstants.errorCodes.OTP_REQUIRED) {
        this.showOtp = true;
      } else {
        notifyError(e);
      }
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style lang="scss">
.page-login__form {
  max-width: 500px;
  margin: auto;
}

.page-login__button-bar {
  margin-top: 8px;
  margin-bottom: 16px;
  text-align: right;
}

.page-login__forgot-password {
  margin-top: 16px;
}
</style>
