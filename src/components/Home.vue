<template>
  <div>
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.9.0/styles/github.min.css">
    <h3 class='m-6'>
      Welcome! This is git, but with columns.
    </h3>
    <div v-if='apiLimit' class='flash m-3 flash-error'>
      Hit the maximum allowed API calls! Please connect your GitHub account to bypass it.
    </div>
    <MillerColumns 
      class='m-3' 
      v-on:display-code='codeUpdate'
      v-on:api-limit='raiseFlash'
      v-on:logged-in='removeFlash'
      style='height: 80vh'
    />
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
import octicons from '@primer/octicons';

export default {
  name: 'Home',
  data: function() {
    return {
      apiLimit: false,
      octicons: octicons,
      cookie: true,
    }
  },
  methods: {
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
