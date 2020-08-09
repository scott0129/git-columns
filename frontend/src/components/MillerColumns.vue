<template>
  <div class='d-block'>
    <input v-model='ownerName' placeholder='owner'>
    <input v-model='repoName' placeholder='repo'>
    <button v-on:click='fetchRepo'>Get</button>

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
const { Octokit } = require('@octokit/rest');

export default {
  name: 'MillerColumns',
  data: function() {
    return {
      octokit: new Octokit(),
      ownerName: '',
      repoName: '',
      tree: [],
      path: '',
    }
  },
  methods: {
    fetchRepo: function() {
      this.fetchPath(this.ownerName, this.repoName, '').then( (fetchedTree) => { this.tree = fetchedTree; });
      console.log(this.tree)
    },
    fetchPath: function(owner, repo, path) {
      return this.octokit.repos.getContent({
        owner: owner,
        repo: repo,
        path: path,
      }).then((res) => {
        let tree = [];
        for (let node of res.data) {
          if (node.type == 'file') {
            tree.push(node);
          } else {
            this.fetchPath(owner, repo, node.path)
              .then((subtree) => tree.push(subtree));
          }
        }
        return tree;
      });
    }
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