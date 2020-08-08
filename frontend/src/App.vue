<template>
  <div id="app">
    <MillerColumns msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import MillerColumns from './components/MillerColumns.vue'

export default {
  name: 'App',
  components: {
    MillerColumns
  }
}
</script>

<style lang="scss">
  @import "@primer/css/index.scss";
  body {
    text-align: center;
  }
</style>

<!--
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
-->
