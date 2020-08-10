<template>
  <div class='d-block'>
    <input v-model='ownerName' placeholder='owner'>
    <input v-model='repoName' placeholder='repo'>
    <button v-on:click='fetchRepo'>Get</button>

    <div id='container' class='Box mx-auto d-flex flex-row' style='overflow: scroll; max-width: 80%'>
      <div class='miller-col' v-for='(column, idx) in columns' :key='column.name'>
        <Row 
          v-for='node in column' 
          :isActive='path[idx] == node.name' 
          :setPathCallback='pathForColAt(idx)'
          :type='node.type'
          :name='node.name' 
          :key='node.name'>
        </Row>
      </div>
      <div v-if='getNodesAt(path).type == "dir"' id='last-col' class='miller-col'>
        <Row 
          v-for='node in getNodesAt(path)' 
          v-bind:setPathCallback='pathForColAt(path.length)'
          :name='node.name' 
          :key='node.name'>
        </Row>
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
      octokit: new Octokit({
        auth: process.env.VUE_APP_ACCESS_TOKEN,
      }),
      ownerName: 'scott0129',
      repoName: 'gosu',
      columns: [],
      wholeTree: [],
      lastCol: [],
      path: [],
    }
  },
  methods: {
    /**
     * Given a list representing a path as such ['src', 'images', 'projects'], return
     * the tree at that node.
     */
    getNodesAt: function(dirNames) {
      let currentDir = this.wholeTree;
      for (let dirName of dirNames) {
        currentDir = currentDir.find(node => node.name == dirName);
      }
      return currentDir;
    },
    /**
     * Given a column index, returns a function that should be called with the path.
     * That way, a unique function is given to every row so that this component can know
     * which was clicked.
     */
    pathForColAt: function(colIdx) {
      function setPath(name) {
        this.path[colIdx] = name;
        this.path.splice(colIdx + 1);

        // Set all columns' contents with the corresponding directory in the WholeTree 
        for (let i = 0; i < this.path.length; i++) {
          let column = this.getNodesAt(
            this.path.slice(0, i)
          );
          this.columns[i] = column;
        }
        this.columns = this.columns.splice(0, this.path.length);

        this.lastCol = this.getNodesAt(this.path);
      }
      return setPath.bind(this);
    },
    fetchRepo: function() {
      this.fetchPath(this.ownerName, this.repoName, '', 3)
        .then( (fetchedTree) => { 
          this.wholeTree = fetchedTree;
          this.wholeTree.type = 'dir';
        });
    },
    fetchPath: function(owner, repo, path, depth) {
      if (!depth || depth <= 0) {
        return Promise.resolve([]);
      }
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
            this.fetchPath(owner, repo, node.path, depth - 1)
              .then((subtree) => {
                subtree.name = node.name;
                subtree.type = node.type;
                tree.push(subtree);
              });
          }
        }
        return tree;
      });
    }
  }, 
  updated: function () {
    this.$nextTick(function () {
      let millerWindow = document.getElementById('last-col')
      if (millerWindow) {
        millerWindow.scrollIntoView({ behavior: 'smooth' });
      }
    })
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
    @extend .menu;
    min-height: 40vh;
    min-width: 33.3%;
  }
</style>