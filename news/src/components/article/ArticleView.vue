<template>
	<section class="article">
		<header>
			<h2>
				<router-link v-if="isDraft" :to="link">{{article.title}}</router-link>
				<template v-else>{{article.title}}</template>
			</h2>
			<div class="article__subtitle">{{article.subtitle}}</div>
			<div class="article__author">by <a :href="authorLink" target="_blank">{{article.author.pseudonym}}</a></div>
		</header>
		<div class="article__content" v-html="article.content"></div>
	</section>
</template>

<script lang="ts">
import { NewsArticleDto } from '@app/shared/dto/news/news-article.dto';
import SharedConstants from '@app/shared/SharedConstants';
import { DateTime } from 'luxon';
import { CHAOS_ARCHIVES_ROOT } from 'src/common/interop';
import { prop, Vue } from 'vue-class-component';

class Props {
	article = prop<NewsArticleDto>({
		required: true
	});
}

export default class ArticleView extends Vue.with(Props) {
	get isDraft() {
		return !!this.article.publishedAt;
	}

	get link() {
		const dateTime = DateTime.fromMillis(this.article.publishedAt!, {
			zone: SharedConstants.FFXIV_SERVER_TIMEZONE
		});
		const year = dateTime.year;
		const month = this.pad2(dateTime.month);
		const day = this.pad2(dateTime.day);
		return `/${year}/${month}/${day}/${this.article.slug}`;
	}

	private pad2(n: number): string {
		return n >= 10 ? n.toString() : `0${n}`;
	}

	get authorLink() {
		const name = this.article.author.name.replace(/ /g, '_');
		const server = this.article.author.server;
		return `${CHAOS_ARCHIVES_ROOT}/${server}/${name}`;
	}
}
</script>

<style lang="scss">
.article {
  flex-basis: 0;
  flex-grow: 1;
  margin-right: 20px;
}

.article h2 a {
	color: inherit;
	border: inherit;
}

.article h2 a:hover {
	color: #551a8b;
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
