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
    <character-details-box>
      <character-detail label="World" :value="character.server" v-if="character.server" />
      <character-detail label="Race" :value="$display.races[character.race]" v-if="character.race" />
      <character-detail label="Occupation" :value="character.occupation" v-if="character.occupation" />
      <character-detail label="Age" :value="character.age" v-if="character.age" />
      <character-detail label="Birthplace" :value="character.birthplace" v-if="character.birthplace" />
      <character-detail label="Residence" :value="character.residence" v-if="character.residence" />
    </character-details-box>
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
    <character-details-box v-if="hasPersonalityBox">
      <character-detail label="Loves" :value="character.loves" v-if="character.loves" />
      <character-detail label="Hates" :value="character.hates" v-if="character.hates" />
      <character-detail label="Motto" :value="character.motto" v-if="character.motto" />
      <character-detail label="Motivation" :value="character.motivation" v-if="character.motivation" />
    </character-details-box>
  </div>
</template>

<script lang="ts">
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import sanitizeHtml from 'sanitize-html';
import { Options, prop, Vue } from 'vue-class-component';
import CharacterDetail from './CharacterDetail.vue';
import CharacterDetailsBox from './CharacterDetailsBox.vue';

class Props {
  character = prop<CharacterProfileDto>({
    required: true,
  });

  showEditLink = prop<boolean>({
    default: true,
  });
}

@Options({
  components: {
    CharacterDetail,
    CharacterDetailsBox
  }
})
export default class CharacterProfile extends Vue.with(Props) {
  get appearance(): string {
    return sanitizeHtml(this.character.appearance);
  }

  get background(): string {
    return sanitizeHtml(this.character.background);
  }

  get hasPersonalityBox(): boolean {
    return !!(this.character.loves
      || this.character.hates
      || this.character.motto
      || this.character.motivation);
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
  font-size: 1.6em;
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
