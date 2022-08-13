<template>
  <q-page class="page-my-content">
		<h2>My Content</h2>
    <div class="page-my-content__subtitle">for {{ $store.getters.character?.name }}</div>

    <q-tabs
          v-model="tab"
          dense
          align="justify"
          narrow-indicator
        >
          <q-tab :name="PageType.EVENT" label="Events" />
          <q-tab :name="PageType.STORY" label="Stories" />
          <q-tab :name="PageType.NOTICEBOARD_ITEM" label="Noticeboard" />
          <q-tab :name="PageType.IMAGE" label="Images" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab">
          <q-tab-panel :name="PageType.EVENT">
            <my-content-list :type="PageType.EVENT" :items="content.events" />
          </q-tab-panel>
          <q-tab-panel :name="PageType.STORY">
            <my-content-list :type="PageType.STORY" :items="content.stories" />
          </q-tab-panel>
          <q-tab-panel :name="PageType.NOTICEBOARD_ITEM">
            <my-content-list :type="PageType.NOTICEBOARD_ITEM" :items="content.noticeboardItems" />
          </q-tab-panel>
          <q-tab-panel :name="PageType.IMAGE">
            <my-images :images="content.images" />
          </q-tab-panel>
        </q-tab-panels>
	</q-page>	
</template>

<script lang="ts">
import { MyContentDto } from '@app/shared/dto/characters/my-content.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import MyImages from 'components/images/MyImages.vue';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import MyContentList from 'src/components/common/MyContentList.vue';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';

async function load(): Promise<MyContentDto> {
	const $api = useApi();
  const $store = useStore();
  const characterId = $store.getters.characterId;

	if (!characterId) {
		notifyError('Unauthorized');
		throw new Error();
	}

  try {
    return await $api.characters.getMyContent(characterId);
  } catch (e) {
    notifyError(e);
    throw e;
  }
}

@Options({
	name: 'PageMyContent',
	components: {
    MyContentList,
		MyImages,
	},
  watch: {
    tab: {
      handler(newValue: PageType, oldValue: PageType) {
        if (newValue !== oldValue) {
          (this as PageMyContent).setTab(newValue);
        }
      }
    }
  },
	async beforeRouteEnter(to, _, next) {
    try {
      const content = await load();
      const tab = to.query.tab as PageType || null;
      next(vm => (vm as PageMyContent).setContent(content, tab));
    } catch (e) {
      console.log(e);
      notifyError(e);
    }
  }
})
export default class PageMyContent extends Vue {
  readonly PageType = PageType;

	content: MyContentDto = {
    events: [],
    stories: [],
    noticeboardItems: [],
    images: []
  };

  tab: PageType | null = null;

	setContent(content: MyContentDto, tab: PageType | null) {
		this.content = content;

    if (!tab) {
      if (content.events.length > 0) {
        this.tab = PageType.EVENT;
      } else if (content.images.length > 0) {
        this.tab = PageType.IMAGE;
      } else if (content.stories.length > 0) {
        this.tab = PageType.STORY;
      } else if (content.noticeboardItems.length > 0) {
        this.tab = PageType.NOTICEBOARD_ITEM;
      } else {
        // no content at all
        this.tab = PageType.EVENT;
      }

      this.setTab(this.tab);
    } else {
      this.tab = tab;
    }
	}

  private setTab(tab: PageType) {
    void this.$router.replace(`/my-content?tab=${tab}`);
  }
}
</script>

<style lang="scss">
.page-my-content h2 {
  margin-bottom: 0;
}

.page-my-content__subtitle {
  text-align: center;
  font-family: $header-font;
  font-size: 1.6em;
  margin-bottom: 24px;
}

.page-my-content .q-tab-panels {
  background: transparent;
}

.page-my-content .q-tab-panel {
  padding-left: 2px;
  padding-right: 2px;
}
</style>