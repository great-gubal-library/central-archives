<template>
  <editor
    class="html-editor"
    api-key="dnguuf3cwxakkez6t1njyi2m6gavgoa97jqo3yt8qoirudgb"
    :init="options"
    :model-value="modelValue"
    @update:model-value="onInput"
  />
</template>

<script lang="ts">
import Editor from '@tinymce/tinymce-vue';
import { Options, Vue } from 'vue-class-component';

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

const TINYMCE_OPTIONS = {
  inline: true,
  plugins: [
    'code advlist autolink lists link image charmap',
    'searchreplace visualblocks',
    'table paste help wordcount'
  ],
  toolbar:
    'undo redo | formatselect | bold italic | \
    alignleft aligncenter alignright alignjustify | \
    image link | bullist numlist outdent indent | removeformat',
  toolbar_mode: 'wrap',
  toolbar_persist: true,
  menu: {
    edit: { title: 'Edit', items: 'undo redo | cut copy paste | selectall | searchreplace' },
    view: { title: 'View', items: 'code | visualaid visualchars visualblocks' },
    insert: { title: 'Insert', items: 'image link | charmap hr | nonbreaking' },
    format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat' },
    table: { title: 'Table', items: 'inserttable | cell row column | tableprops deletetable' },
    help: { title: 'Help', items: 'help' }
  },
  menubar: 'edit view insert format table help',
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

@Options({
  components: {
    Editor
  },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
})
export default class HtmlEditor extends Vue {
  readonly options = TINYMCE_OPTIONS;

  onInput(newValue: string) {
    this.$emit('update:modelValue', newValue);
  }
}
</script>

<style lang="scss">
@import url($extraGoogleFonts);

.html-editor {
  height: 400px;
  margin-top: 86px;
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
</style>