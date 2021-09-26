<template>
  <div class="character-profile">
    <q-responsive :ratio="590 / 150" class="character-profile__banner">
      <div>Banner</div>
    </q-responsive>
    <p v-if="showEditLink && character.mine">
      <router-link to="/edit-character">Edit profile</router-link>
    </p>
    <header class="character-profile__header">
      <div class="layout__filler">
        <q-avatar round>
          <img :src="character.avatar" />
        </q-avatar>
      </div>
      <div class="character-profile__header-names">
        <div v-if="character.title" class="character-profile__header-subtitle">{{ character.title }}</div>
        <h2 class="character-profile__header-title">{{ character.name }}</h2>
        <div v-if="character.nickname" class="character-profile__header-subtitle">«{{ character.nickname }}»</div>
      </div>
      <div class="layout__filler"></div>
    </header>
    <q-card>
      <section class="row character-profile__details">
        <div class="col-12 col-md-6">
          <table>
            <tr>
              <td>World</td>
              <td>{{ character.server }}</td>
            </tr>
            <tr>
              <td>Occupation</td>
              <td>{{ character.occupation }}</td>
            </tr>
            <tr>
              <td>Age</td>
              <td>{{ character.age }}</td>
            </tr>
          </table>
        </div>
        <div class="col-12 col-md-6">
          <tr>
            <td>Race</td>
            <td>{{ $display.races[character.race] }}</td>
          </tr>
          <tr>
            <td>Birthplace</td>
            <td>{{ character.birthplace }}</td>
          </tr>
          <tr>
            <td>Residence</td>
            <td>{{ character.residence }}</td>
          </tr>
        </div>
      </section>
    </q-card>
    <template v-if="character.appearance">
      <h3>Outward appearance</h3>
      <section
        class="character-profile__appearance-background"
        v-html="appearance"
      ></section>
      <template v-if="character.background"><hr /></template>
    </template>
    <template v-if="character.background">
      <h3>Background</h3>
      <section
        class="character-profile__appearance-background"
        v-html="background"
      ></section>
    </template>
    <template v-if="!character.appearance && !character.background">
      &nbsp;
    </template>
    <q-card>
      <section class="row character-profile__details">
        <div class="col-12 col-md-6">
          <table>
            <tr>
              <td>Loves</td>
              <td>{{ character.loves }}</td>
            </tr>
            <tr>
              <td>Motto</td>
              <td>{{ character.motto }}</td>
            </tr>
          </table>
        </div>
        <div class="col-12 col-md-6">
          <tr>
            <td>Hates</td>
            <td>{{ character.hates }}</td>
          </tr>
          <tr>
            <td>Motivation</td>
            <td>{{ character.motivation }}</td>
          </tr>
        </div>
      </section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { prop, Vue } from 'vue-class-component';
import sanitizeHtml from 'sanitize-html';

class Props {
  character = prop<CharacterProfileDto>({
    required: true,
  });

  showEditLink = prop<boolean>({
    default: true,
  });
}

export default class CharacterProfile extends Vue.with(Props) {
  get appearance(): string {
    return sanitizeHtml(this.character.appearance);
  }

  get background(): string {
    return sanitizeHtml(this.character.background);
  }
}
</script>

<style lang="scss">
.character-profile__banner {
  background: #80a0c0;
  color: white;
  margin-bottom: 16px;
}

.character-profile__banner div {
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-profile__header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.character-profile__header-title {
  margin: 0;
  line-height: auto;
}

.character-profile__header-names {
  text-align: center;
}

.character-profile__header-subtitle {
  font-family: $header-font;
  font-size: 1.4em;
}

.character-profile__details td {
  padding: 4px 8px;
}

.character-profile__details tr > td:first-child {
  font-weight: bold;
}

.character-profile__appearance-background {
  margin-bottom: 24px;
}
</style>
