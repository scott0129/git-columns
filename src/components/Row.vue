<template>
  <div class='menu-item Box-row'
       v-on:click='$emit("row-click", name, colIdx)'
       v-bind:class='{active: isActive}'
       style='display: flex'>
    <div
      class='mr-3 flex-shrink-0'
      v-if='type == "file"'
      v-html='octicons["file"].toSVG({class: "octicon octicon-file text-gray-light"})'>
    </div>
    <div 
      class='mr-3 flex-shrink-0'
      v-if='type == "dir"'
      v-html='octicons["file-directory"].toSVG({class: "octicon octicon-file-directory color-blue-3"})'>
    </div>
    <span class='css-truncate css-truncate-target d-block width-fit mr-1' >
      {{name}}
    </span>
  </div>
</template>

<script>
import octicons from '@primer/octicons';

export default {
  name: 'Row',
  data: function () {
    return {
      count: 0,
      octicons: octicons,
    }
  },
  props: {
    name: String,
    path: String,
    type: String,
    colIdx: Number,
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
