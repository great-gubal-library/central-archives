<template>
  <div>
    Body text
  </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component'
import { Todo, Meta } from './models'

class Props {
  readonly title!: string;
  readonly todos = prop<Todo[]>({ default: () => [] });
  readonly meta!: Meta;
  readonly active!: boolean;
}

export default class ClassComponent extends Vue.with(Props) {
  clickCount = 0;

  increment () {
    this.clickCount += 1
  }

  get todoCount () {
    return this.todos.length
  }
}
</script>
