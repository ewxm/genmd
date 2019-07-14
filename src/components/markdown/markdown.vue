<template>
  <div class="markdown-wrapper">
    <textarea ref="editor"></textarea>
  </div>
</template>

<script>
import Simplemde from "simplemde";
import "simplemde/dist/simplemde.min.css";
export default {
  name: "MarkdownEditor",
  props: {
    value: {
      type: String,
      default: ""
    },
    options: {
      type: Object,
      default: () => {
        return {};
      }
    },
    localCache: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      editor: null
    };
  },
  methods: {
    addEvents() {
      this.editor.codemirror.on("change", () => {
        let value = this.editor.value();
        if (this.localCache) localStorage.markdownContent = value;
        this.$emit("input", value);
        this.$emit("on-change", value);
      });
      this.editor.codemirror.on("focus", () => {
        this.$emit("on-focus", this.editor.value());
      });
      this.editor.codemirror.on("blur", () => {
        this.$emit("on-blur", this.editor.value());
      });
    },
    updateText(value) {
      this.editor.value(value);
    }
  },
  mounted() {
    this.editor = new Simplemde(
      //https://www.npmjs.com/package/simplemde
      Object.assign(this.options, {
        element: this.$refs.editor,
        autofocus: true,
        // toolbar: false
      })
    );
    /**
     * 事件列表为Codemirror编辑器的事件，更多事件类型，请参考：
     * https://codemirror.net/doc/manual.html#events
     */
    this.addEvents();
    if (this.value) this.editor.value(this.value);
  }
};
</script>

<style lang="less">
.markdown-wrapper {
  .editor-toolbar.fullscreen {
    z-index: 9999;
  }
  .CodeMirror-fullscreen {
    z-index: 9999;
  }
  .CodeMirror-fullscreen ~ .editor-preview-side {
    z-index: 9999;
  }
}
</style>
