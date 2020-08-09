<template>
  <div class='d-block'>
    <div class='Box mx-auto d-flex flex-row' style='overflow: hidden; max-width: 80%'>
      <div class='miller-col'>
        <Row name='hello'></Row>
        <Row name='hello2'></Row>
      </div	>
      <div class='miller-col'>
        <Row name='goodbye'></Row>
      </div	>
      <div class='miller-col'>
        <Row name='me too!'></Row>
      </div	>
    </div>
  </div>
</template>

<script>
import Row from './Row.vue'

export default {
  name: 'MillerColumns',
  props: {
  },
  components: {
    Row
  }
}
</script>

<style lang="scss">
  @import "@primer/css/index.scss";

  .Box-col:first-of-type {
    @extend .rounded-left-2;
    border-left: none;
  }

  .Box-col:last-of-type {
    @extend .rounded-right-2;
  }

  .Box-col {
    padding: 16px;
    margin-top: -1px;
    list-style-type: none;
    border-left: 1px #e1e4e8 solid;
  }

  .miller-col {
    @extend .flex-1;
    @extend .Box-col;
    min-height: 80vh;
  }
</style>