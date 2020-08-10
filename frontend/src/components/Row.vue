<template>
  <div class='Box-row'>
    <span class='css-truncate d-block width-fit'>
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
    selected: Boolean
  }
}
</script>

<style lang="scss">
</style>
