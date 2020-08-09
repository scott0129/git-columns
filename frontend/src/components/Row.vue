<template>
  <div class='row'>
    <p>
      {{name}}
    </p>
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
