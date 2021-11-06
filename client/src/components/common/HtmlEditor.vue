<template>
  <div class="html-editor">
    <div :id="toolbarId" class="html-editor__toolbar"></div>
    <editor
    class="html-editor__editor"
    :style="{ height: height }"
    api-key="dnguuf3cwxakkez6t1njyi2m6gavgoa97jqo3yt8qoirudgb"
    :init="options"
    :model-value="modelValue"
    @update:model-value="onInput"
  />
  </div>
</template>

<script lang="ts">
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import Editor from '@tinymce/tinymce-vue';
import { Options, prop, Vue } from 'vue-class-component';

const FONTS = [
  // Three main ones
  'Noto Sans',
  'Cinzel',
  'Michroma',
  // Extra fonts
  'Alegreya',
  'Alegreya Sans',
  'EB Garamond',
  'Lato',
  'Merriweather',
  'Oswald',
  'Roboto',
  'Playfair Display',
  'PT Serif',
  'Raleway',
];

const FONT_OPTION = FONTS.map(font => `${font}=${font},sans-serif`).join(';');

const TINYMCE_PLUGINS = [
  'code advlist autolink lists link image charmap',
  'searchreplace visualblocks',
  'table paste help wordcount'
];

const TINYMCE_OPTIONS = {
  inline: true,
  toolbar:
    'undo redo | formatselect | bold italic | \
    alignleft aligncenter alignright alignjustify | \
    image gallery upload link | bullist numlist | removeformat',
  toolbar_mode: 'wrap',
  toolbar_persist: true,
  menu: {
    edit: { title: 'Edit', items: 'undo redo | cut copy paste | selectall | searchreplace' },
    view: { title: 'View', items: 'code | visualaid visualchars visualblocks' },
    insert: { title: 'Insert', items: 'image gallery upload link | charmap hr | nonbreaking' },
    format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat' },
    list: { title: 'List', items: 'outdent indent' },
    table: { title: 'Table', items: 'inserttable | cell row column | tableprops deletetable' },
    help: { title: 'Help', items: 'help' }
  },
  menubar: 'edit view insert format list table help',
  image_title: false,
  image_description: false,
  link_title: false,
  block_formats: 'Paragraph=p; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6',
  font_formats: FONT_OPTION,
  style_formats: [
    { title: 'Headings', items: [
      { title: 'Heading 3', format: 'h3' },
      { title: 'Heading 4', format: 'h4' },
      { title: 'Heading 5', format: 'h5' },
      { title: 'Heading 6', format: 'h6' }
    ]},
    { title: 'Inline', items: [
      { title: 'Bold', format: 'bold' },
      { title: 'Italic', format: 'italic' },
      { title: 'Underline', format: 'underline' },
      { title: 'Strikethrough', format: 'strikethrough' },
      { title: 'Superscript', format: 'superscript' },
      { title: 'Subscript', format: 'subscript' },
      { title: 'Code', format: 'code' }
    ]},
    { title: 'Blocks', items: [
      { title: 'Paragraph', format: 'p' },
      { title: 'Blockquote', format: 'blockquote' },
      { title: 'Div', format: 'div' },
      { title: 'Pre', format: 'pre' }
    ]},
    { title: 'Align', items: [
      { title: 'Left', format: 'alignleft' },
      { title: 'Center', format: 'aligncenter' },
      { title: 'Right', format: 'alignright' },
      { title: 'Justify', format: 'alignjustify' }
    ]}
  ],
  fontsize_formats: '8pt 10.5pt 12pt 14pt 18pt 24pt 36pt',
};

let uid = 0;

class Props {
  modelValue = prop<string>({
    required: true,
  });

  height = prop<string>({
    default: '400px',
  });

  allowImages = prop<boolean>({
    default: true
  });
}

@Options({
  name: 'HtmlEditor',
  components: {
    Editor
  },
})
export default class HtmlEditor extends Vue.with(Props) {
  toolbarId = `html-editor__toolbar${uid++}`;

  get options() {
    let plugins: string[];

    if (this.allowImages) {
      plugins = TINYMCE_PLUGINS;
    } else {
      plugins = TINYMCE_PLUGINS.map(str => str.replace(/image/g, ''));
    }

    return {
      ...TINYMCE_OPTIONS,
      plugins,
      fixed_toolbar_container: `#${this.toolbarId}`,
      setup: (editor: any) => {
        editor.ui.registry.addMenuItem('outdent', {
          text: 'Decrease indent',
          icon: 'outdent',
          onAction: () => editor.execCommand('Outdent')
        });

        editor.ui.registry.addMenuItem('indent', {
          text: 'Increase indent',
          icon: 'indent',
          onAction: () => editor.execCommand('Indent')
        });

        if (this.allowImages) {
          editor.ui.registry.addMenuItem('upload', {
            text: 'Upload image...',
            icon: 'upload',
            onAction: () => this.onUploadClick(editor)
          });

          editor.ui.registry.addButton('gallery', {
            tooltip: 'Upload image',
            icon: 'upload',
            onAction: () => this.onUploadClick(editor)
          });
        }
      }
    };
  }

  onInput(newValue: string) {
    this.$emit('update:modelValue', newValue);
  }

  private async onUploadClick(editor: any) {
    const UploadDialog = (await import('components/upload/UploadDialog.vue')).default;

    this.$q.dialog({
      component: UploadDialog
    }).onOk((image: ImageSummaryDto) => {
      this.insertImage(editor, image.url, image.width, image.height, image.title);
    });
  }

  private insertImage(editor: any, src: string, width: number, height: number, title: string) {
    const img = document.createElement('img');
    img.src = src;
    img.width = width;
    img.height = height;
    img.alt = title;
    editor.focus();
    editor.selection.setContent(img.outerHTML);
  }
}
</script>

<style lang="scss">
@import url($extraGoogleFonts);

.html-editor__editor {
  height: 400px;
  background: white;
  border: 1px solid #aaa;
  padding: 8px;
  overflow-y: auto;
}

.html-editor h6 {
  font-family: $header-font;
}

.tox, .tox-tinymce {
  font-family: $body-font!important;
}

.html-editor__toolbar {
  width: calc(100% + 4px);
}
</style>