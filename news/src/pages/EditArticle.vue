<template>
  <section class="page-edit-article">
    <template v-if="loaded">
      <h2>{{ article.id ? 'Edit Article' : 'Submit New Article' }}</h2>
      <q-form ref="form" @submit="onSubmit">
        <section v-if="!preview" class="page-edit-article__form-controls">
          <label>
            <template v-if="article.status === NewsStatus.SUBMITTED">Submitted for publication</template>
            <template v-else-if="article.status === NewsStatus.PUBLISHED">Published on {{ $display.formatDateEorzean(article.publishedAt) }}</template>
            <template v-else>DRAFT</template>
          </label>
          <q-input
            v-model="article.title"
            label="Title *"
            :rules="[
              $rules.required('This field is required.'),
            ]"
          />
					<q-input
            v-model="article.subtitle"
            label="Subtitle"
          />
          <h6>Summary *</h6>
          <div class="text-caption">A short summary of what the article is about. It will not be displayed on the Harborwatch website, but will be displayed on the Chaos Archives front page.</div>
          <q-input
            class="page-edit-article__summary"
            type="textarea"
            outlined
            v-model="article.summary"
            :rules="[
              $rules.required('This field is required.'),
            ]"
          />
          <h6>Content *</h6>
          <html-editor v-model="article.content" />
        </section>
        <section v-else class="page-edit-article__preview">
          <article-view :article="article" :preview="true" />
        </section>
        <div class="page-edit-article__button-bar page-edit-article__form-controls">
          <q-btn-toggle
            v-model="preview"
            :options="previewOptions"
            toggle-color="secondary"
          />
          <div class="page-edit-article__revert-submit">
            <q-btn label="Revert" color="secondary" @click="revert" />&nbsp;
            <template v-if="article.status === NewsStatus.DRAFT">
              <q-btn label="Save draft" color="primary" @click="saveDraft" />&nbsp;
              <q-btn label="Submit for publication" color="negative" @click="submitForPublication" />
            </template>
            <template v-else>
              <q-btn label="Save changes" type="submit" color="primary" />
              <template v-if="article.status === NewsStatus.SUBMITTED && $store.getters.character?.newsRole === NewsRole.EDITOR">&nbsp;
              <q-btn label="Publish" color="negative" @click="publish" />
              </template>
            </template>
          </div>
        </div>
        <q-inner-loading :showing="saving" />
      </q-form>
    </template>
    <q-spinner v-else />

    <q-dialog v-model="confirmRevert" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm"
            >Do you want to revert your unsaved changes to the last saved
            version?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Keep editing" color="secondary" v-close-popup />
          <q-btn
            flat
            label="Revert"
            color="negative"
            v-close-popup
            @click="onConfirmRevert"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script lang="ts">
import { NewsArticleDto } from '@app/shared/dto/news/news-article.dto';
import HtmlEditor from 'components/common/HtmlEditor.vue';
import ArticleView from 'components/article/ArticleView.vue';
import { notifyError, notifySuccess } from 'src/common/notify';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import { NewsStatus } from '@app/shared/enums/news-status.enum';
import { QForm } from 'quasar';
import { NewsRole } from '@app/shared/enums/news-role.enum';

@Options({
  name: 'PageEditArticle',
  components: {
    HtmlEditor,
    ArticleView,
  },
  beforeRouteEnter(to, _, next) {
    next((vm) => (vm as PageEditArticle).load(to.params));
  },
  async beforeRouteUpdate(to) {
    await (this as PageEditArticle).load(to.params);
  },
})
export default class PageEditArticle extends Vue {
  readonly NewsStatus = NewsStatus;
  readonly NewsRole = NewsRole;

  readonly previewOptions = [
    { label: 'Edit', value: false },
    { label: 'Preview', value: true },
  ];

  article = new NewsArticleDto();
  articleBackup = new NewsArticleDto();
  preview = false;
  loaded = false;
  saving = false;
  submittingForPublication = false;
  publishing = false;

  confirmRevert = false;

  private async load(params: RouteParams) {
    const id = parseInt(params.id as string, 10);
    const character = this.$store.getters.character;

    if (!character) {
      void this.$router.push('/');
      return;
    }

    if (id) {
      this.loaded = false;
      this.articleBackup = await this.$api.news.getArticleById(id);
      this.loaded = true;
    } else {
      this.articleBackup = new NewsArticleDto({
        canEdit: true,
        canDelete: true,
        status: NewsStatus.DRAFT,
        publishedAt: null as unknown as number,
        title: '',
				subtitle: '',
        summary: '',
        content: '',
        slug: '',
        category: '',
				author: {
					name: character.name,
        	server: character.server,
					pseudonym: character.newsPseudonym || character.name,
				}
      });
      this.loaded = true;
    }

    this.article = new NewsArticleDto(this.articleBackup);
  }

  revert() {
    this.confirmRevert = true;
  }

  onConfirmRevert() {
    this.article = new NewsArticleDto(this.articleBackup);
  }

  saveDraft() {
    this.submittingForPublication = false;
    (this.$refs.form as QForm).submit();
  }

  async submitForPublication() {
    const form = this.$refs.form as QForm;

    if (!(await form.validate())) {
      return;
    }

    this.$q.dialog({
      title: 'Confirm Submitting for Publication',
      message: "You're almost done! If you believe your article is ready, you can submit it for publication, so the Harborwatch editor can review it and include it in a future issue of the paper.",
      ok: {
        label: 'Submit',
        color: 'primary',
        flat: true,
      },
      cancel: {
        label: 'Cancel',
        color: 'secondary',
        flat: true,
      }
    })
    .onOk(() => {
      this.submittingForPublication = true;
      form.submit();
    });    
  }

  async publish() {
    const form = this.$refs.form as QForm;

    if (!(await form.validate())) {
      return;
    }

    this.$q.dialog({
      title: 'Confirm Publication',
      message: "Are you sure you want to publish this article?",
      ok: {
        label: 'Publish',
        color: 'primary',
        flat: true,
      },
      cancel: {
        label: 'Cancel',
        color: 'secondary',
        flat: true,
      }
    })
    .onOk(() => {
      this.publishing = true;
      form.submit();
    });    
  }

  async onSubmit() {
    this.saving = true;

    try {
      const savedArticle = new NewsArticleDto(this.article);

      if (this.submittingForPublication && this.article.status === NewsStatus.DRAFT) {
        savedArticle.status = NewsStatus.SUBMITTED;
      } else if (this.publishing && this.article.status === NewsStatus.SUBMITTED) {
        savedArticle.status = NewsStatus.PUBLISHED;
      }

      if (!this.article.id) {
        this.article = new NewsArticleDto(await this.$api.news.createArticle(savedArticle));
        void this.$router.replace(`/edit-article/${this.article.id!}`);
      } else {
        this.article = new NewsArticleDto(await this.$api.news.editArticle(savedArticle));
      }

      this.articleBackup = new NewsArticleDto(this.article);

      notifySuccess('Article saved.' /*, {
        label: 'View',
        color: 'white',
        //handler: () => this.viewArticle(),
      } */);
    } catch (e) {
      notifyError(e);
    } finally {
      this.saving = false;
    }
  }
}
</script>

<style lang="scss">
.page-edit-article__form-controls {
  max-width: 900px;
  margin: auto;
}

.page-edit-article__summary .q-field__inner {
  background: white;
}

.page-edit-article__preview {
  margin-bottom: 24px;
}

.page-edit-article__button-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 16px;
}

.page-edit-article__preview h6 {
  font-family: $header-font;
}

.page-edit-article__type-label {
  margin-top: 12px;
}

.page-edit-article .article__content {
  columns: 2;
}
</style>
