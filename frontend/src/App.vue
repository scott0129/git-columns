<template>
  <div id="app">
    <h1>{{ msg }}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <MillerColumns/>
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
