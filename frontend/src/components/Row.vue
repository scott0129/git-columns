<template>
  <div class='menu-item' v-on:click='setPathCallback(name)' v-bind:class="{active: isActive}">
    <span class='css-truncate css-truncate-target d-block width-fit mr-1' >
      {{name}}
    </span>
  </div>
</template>

<script>
export default {
  name: 'Row',
  data: function () {
    return {
      count: 0
    }
  },
  props: {
    name: String,
    path: String,
    type: String,
    isActive: Boolean,
    data: Object,
    setPathCallback: Function,
  }
}
</script>

<style lang="scss">
.active, .active:focus {
  background-color: #abcedf !important;
}
</style>
