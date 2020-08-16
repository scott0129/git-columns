<template>
  <div>
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.9.0/styles/github.min.css">
    <h2 class='m-6'>
      Welcome! This is git, but with columns.
    </h2>
    <div class='d-flex m-8'>
      <MillerColumns class='m-3' style='width: 50%' v-on:display-code='codeUpdate'/>
      <div class='Box m-3 position-relative' style='width: 50%; max-height: 80vh; overflow: scroll' >
        <div class='Box-header py-2 d-flex flex-column flex-shrink-0 flex-md-row flex-md-items-center'></div>
        <div class='Box-body blob js-code-block-container p-0' style='text-align: left'>
          <pre><code v-html="sourceCode"></code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MillerColumns from './MillerColumns'
import hljs from 'highlight.js'

export default {
  name: 'Home',
  data: function() {
    return {
      sourceCode: '',
    }
  },
  methods: {
    codeUpdate: function(sourceCode) {
      this.sourceCode = hljs.highlightAuto(sourceCode).value
    }
  },
  components: {
    MillerColumns
  }
}
</script>

<style lang="scss">
</style>
