import { CharacterRefreshResultDto } from '@app/shared/dto/characters/character-refresh-result.dto'
import { SessionDto } from '@app/shared/dto/user/session.dto'
import { store } from 'quasar/wrappers'
import { InjectionKey } from 'vue'
import {
  createStore,
  Store as VuexStore,
} from 'vuex'

// import example from './module-example'
// import { ExampleStateInterface } from './module-example/state';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export interface StateInterface {
  // Define your own store structure, using submodules if needed
  // example: ExampleStateInterface;
  // Declared as unknown to avoid linting issue. Best to strongly type as per the line above.
  user: SessionDto | null
}

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: VuexStore<StateInterface>
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<StateInterface>> = Symbol('vuex-key')

let $store: VuexStore<StateInterface>;

export default store(function (/* { ssrContext } */) {
  $store = createStore<StateInterface>({
    modules: {
      // example
    },

    mutations: {
      setUser(state, user: SessionDto) {
        state.user = user;
      },

      updateCharacter(state, characterData: CharacterRefreshResultDto) {
        if (!state.user) {
          return;
        }

        const { name, server, avatar } = characterData;
        Object.assign(state.user.character, { name, server, avatar });
      }
    },

    getters: {
      characterShortName(state) {
        return state.user ? state.user.character.name.split(' ')[0] : null;
      }
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: !!process.env.DEBUGGING
  })

  return $store;
})

export function useStore() {
  return $store
}