<template>
  <section class="page-index">
    <section class="article">
      <header>
        <h2>The Time for Adventurers</h2>
        <div class="article__subtitle">The Wayfarers&rsquo; Initiative announced at Revenant&rsquo;s Toll</div>
        <div class="article__author">by <a href="https://chaosarchives.org/Omega/Vielle_Janlenoux" target="_blank">Vielle Flower</a></div>
      </header>
      <div class="article__content" v-html="article"></div>
    </section>
    <section class="article">
      <header>
        <h2>The Far East Awaits!</h2>
        <div class="article__subtitle">Expedition across the seas to set sail from Limsa</div>
        <div class="article__author">by <a href="https://chaosarchives.org/Omega/Vielle_Janlenoux" target="_blank">Vielle Flower</a></div>
      </header>
      <div class="article__content" v-html="article2"></div>
    </section>
  </section>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import article from 'src/markdown/article.md';
import article2 from 'src/markdown/article2.md';

@Options({
  name: 'PageIndex',
  components: {
  },
})
export default class PageIndex extends Vue {
  readonly article = article;
  readonly article2 = article2;
}
</script>

<style lang="scss">
.page-index {
  display: flex;
  margin-right: -20px;
}

.article {
  flex-basis: 0;
  flex-grow: 1;
  margin-right: 20px;
}

.article__content {
  /*column-count: 3; */
  column-rule: 1px solid #555;
  margin-bottom: 4rem;
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

.article__author {
  font-size: 20px;
}
</style>
