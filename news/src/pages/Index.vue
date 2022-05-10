<template>
  <section class="article">
    <header>
      <h2>Adventure on Two Fronts</h2>
      <div class="article__subtitle">by <a href="https://chaosarchives.org/Omega/Vielle_Janlenoux" target="_blank">Vielle Flower</a></div>
    </header>
    <div class="article__content" v-html="article"></div>
  </section>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import article from 'src/markdown/article.md';

@Options({
  name: 'PageIndex',
  components: {
  },
})
export default class PageIndex extends Vue {
  readonly article = article;
}
</script>

<style lang="scss">
.article__content {
  column-count: 3;
}

.article__content p:first-child::first-letter {
  font-size: 350%;
  padding: 10px 5px 0 0;
  float: left;
  color: #333;
}

.article header {
  text-align: center;
  margin-bottom: 1.6rem;
}

.article h2 {
  margin-top: 0;
  margin-bottom: 0;
}

.article__subtitle {
  font-size: 24px;
}
</style>
