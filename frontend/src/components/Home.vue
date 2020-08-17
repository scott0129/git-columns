<template>
  <div>
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.9.0/styles/github.min.css">
    <h2 class='m-6'>
      Welcome! This is git, but with columns.
    </h2>
    <div v-if='apiLimit' class='flash m-3 flash-error'>
      Hit the maximum allowed API calls! Please connect your GitHub account to bypass it.
    </div>
    <div class='d-flex m-2'>
      <MillerColumns 
        class='m-3' 
        style='width: 50%'
        v-on:display-code='codeUpdate'
        v-on:api-limit='raiseFlash'
        v-on:logged-in='removeFlash'
      />
      <div class='Box m-3 position-relative' style='width: 50%; max-height: 80vh; overflow: scroll' >
        <div class='Box-header py-2 d-flex flex-column flex-shrink-0 flex-md-row flex-md-items-center'></div>
        <div class='Box-body blob js-code-block-container p-0' style='text-align: left'>
          <pre><code v-html="sourceCode"></code></pre>
        </div>
      </div>
    </div>
    <div class="flash m-6" v-if='cookie'>
      I use cookies to keep you logged in. I think there's some law where I have to say that.
    <button class="flash-close js-flash-close" type="button" v-on:click='closeCookie'>
      <div 
        v-html='octicons["x"].toSVG({class: "octicon octicon-x"})'>
      </div>
    </button>
  </div>
  </div>
</template>

<script>
import MillerColumns from './MillerColumns'
import hljs from 'highlight.js'
import octicons from '@primer/octicons';

export default {
  name: 'Home',
  data: function() {
    return {
      sourceCode: '',
      apiLimit: false,
      octicons: octicons,
      cookie: true,
    }
  },
  methods: {
    codeUpdate: function(sourceCode) {
      this.sourceCode = hljs.highlightAuto(sourceCode).value
    },
    closeCookie: function() {
      this.cookie = false;
    },
    raiseFlash: function() {
      this.apiLimit = true;
    },
    removeFlash: function() {
      this.apiLimit = false;
    }
  },
  components: {
    MillerColumns
  }
}
</script>

<style lang="scss">
</style>
