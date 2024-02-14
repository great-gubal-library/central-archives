<template>
  <q-form class="logout-everywhere" @submit="onSubmit">
    <h3>Log Out on Other Devices</h3>
    <p>
      To protect your privacy, {{$siteName}} does not store information about your login history. This button will log
      you out on all devices except this browser window, including any third-party programs logged into your {{$siteName}} account.
    </p>
    <q-btn color="negative" label="Log Out on Other Devices" @click="onSubmit" />
    <q-inner-loading :showing="loading" />
  </q-form>
</template>

<script lang="ts">
import { notifyError, notifySuccess } from 'src/common/notify';
import { Options, Vue } from 'vue-class-component';

@Options({
  name: 'LogoutEverywhere',
})
export default class LogoutEverywhere extends Vue {
  loading = false;

  onSubmit() {
    this.$q
      .dialog({
        title: 'Confirm Logging Out on Other Devices',
        message:
          '<p>You are about to be logged out on <strong>all</strong> devices except this browser window, including other browser sessions and any third-party programs logged in to your {{$siteName}} account.</p><p><strong>This action cannot be undone.</strong></p><p>Proceed?</p>',
        html: true,
        ok: {
          label: 'Proceed',
          color: 'negative',
          flat: true,
        },
        cancel: 'Cancel',
      })
      .onOk(async () => {
        this.loading = true;

        try {
          const newAccessToken = await this.$api.user.logoutEverywhere();
          this.$api.setAccessToken(newAccessToken.newAccessToken);
          notifySuccess('You have been logged out of all other devices.');
        } catch (e) {
          notifyError(e);
        } finally {
          this.loading = false;
        }
      });

    this.loading = true;

    try {
    } catch (e) {
      notifyError(e);
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style lang="scss">
.logout-everywhere {
  max-width: 500px;
}

.logout-everywhere__email-field {
  background: #f4f4f4;
}

.logout-everywhere__button-bar {
  text-align: right;
}
</style>
