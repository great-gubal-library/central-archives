import { CharacterRefreshResultDto } from '@app/shared/dto/characters/character-refresh-result.dto'
import { EventDto } from '@app/shared/dto/events/event.dto'
import { SessionCharacterDto } from '@app/shared/dto/user/session-character.dto'
import { SessionDto } from '@app/shared/dto/user/session.dto'
import { Role } from '@app/shared/enums/role.enum'
import { LocalStorage } from 'quasar'
import { store } from 'quasar/wrappers'
// import { useApi } from 'src/boot/axios'
import { InjectionKey } from 'vue'
import {
  createStore,
  Store as VuexStore
} from 'vuex'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export interface StoreUser {
  id: number;
  role: Role;
  currentCharacterId: number;
  characters: Map<number, SessionCharacterDto>;
}

export interface StateInterface {
  user: StoreUser | null;
  events: EventDto[];
}

export interface GettersInterface {
  characterId: number|null;
  characterShortName: string|null;
  character: SessionCharacterDto|null;
  role: Role|null;
  realRole: Role|null;
}

type CAStore = Omit<VuexStore<StateInterface>, 'getters'> & { getters: GettersInterface };

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: CAStore
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<StateInterface>> = Symbol('vuex-key')

let $store: CAStore;

export default store(function (/* { ssrContext } */) {
  $store = createStore<StateInterface>({
    modules: {
      // example
    },

    state: {
      user: null,
      events: [],
    },

    mutations: {
      setUser(state, user: SessionDto | null) {
        if (user === null) {
          state.user = null;
          return;
        }

        const characters = toMap(user.characters);
        let currentCharacterId = getCurrentCharacterId();

        if (!currentCharacterId || !characters.get(currentCharacterId)) {
          currentCharacterId = user.characters[0].id;
          setCurrentCharacterId(currentCharacterId);
        }

        state.user = {
          id: user.id,
          role: user.role,
          characters,
          currentCharacterId
        };
      },

      setCurrentCharacterId(state, characterId: number) {
        if (state.user === null || !state.user.characters.get(characterId)) {
          return;
        }

        state.user.currentCharacterId = characterId;
        setCurrentCharacterId(characterId);
      },

      addCharacter(state, character: SessionCharacterDto) {
        if (state.user === null) {
          return;
        }

        state.user.characters.set(character.id, character);
      },

      updateCharacter(state, characterData: CharacterRefreshResultDto) {
        if (!state.user) {
          return;
        }

        const { name, server, avatar } = characterData;
        Object.assign(state.user.characters.get(state.user.currentCharacterId)!, { name, server, avatar });
      },

      setEvents(state, events: EventDto[]) {
        state.events = events;
      }
    },

    /*
    actions: {
      async updateEvents() {
        const api = useApi();
        const events = (await api.events.getEvents({ refresh: false })).events;
        this.commit('setEvents', events);
      }
    },
    */

    getters: {
      characterId(state): number|null {
        return state.user ? state.user.currentCharacterId : null
      },

      characterShortName(state): string|null {
        if (!state.user) {
          return null;
        }

        const character = state.user.characters.get(state.user.currentCharacterId)!;
        return character.name.split(' ')[0];
      },

      character(state): SessionCharacterDto|null {
        if (!state.user) {
          return null;
        }

        return state.user.characters.get(state.user.currentCharacterId)!;
      },

      role(state): Role|null {
        if (!state.user) {
          return null;
        }

        const character = state.user.characters.get(state.user.currentCharacterId)!;

        if (!character.verified) {
          return Role.UNVERIFIED;
        }

        return state.user.role;
      },

      realRole(state): Role|null {
        if (!state.user) {
          return null;
        }

        return state.user.role;
      }
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: !!process.env.DEBUGGING
  })

  return $store;
})

function getCurrentCharacterId(): number|null {
  return LocalStorage.getItem('currentCharacterId');
}

function setCurrentCharacterId(currentCharacterId: number) {
  LocalStorage.set('currentCharacterId', currentCharacterId);
}

function toMap(characters: SessionCharacterDto[]) {
  const result = new Map<number, SessionCharacterDto>();

  for (const character of characters) {
    result.set(character.id, character);
  }

  return result;
}

export function useStore() {
  return $store
}
