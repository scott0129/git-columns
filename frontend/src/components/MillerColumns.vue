<template>
  <div class='d-block'>
      <div v-if='!user'>
        <button @click.prevent='connect'>Connect to GitHub</button>
      </div>
    <input v-model='ownerName' placeholder='owner'>
    <input v-model='repoName' placeholder='repo'>
    <button v-on:click='fetchRepo'>Get</button>

    <div id='container' class='Box mx-auto d-flex flex-row' style='overflow: scroll; max-width: 100%'>
      <div class='miller-col' v-for='(column, idx) in columns' :key='column.name' style='max-height: 80vh; overflow: scroll'>
        <Row 
          v-for='node in column' 
          v-on:row-click='rowClicked'
          :isActive='path[idx] == node.name' 
          :colIdx='idx'
          :type='node.type'
          :name='node.name' 
          :key='node.name'>
        </Row>
      </div>
      <div v-if='this.getNodesAt(path).type == "dir"' id='last-col' class='miller-col' style='max-height: 80vh; overflow: scroll'>
        <Row 
          v-for='node in this.getNodesAt(path).files' 
          v-on:row-click='rowClicked'
          :colIdx='path.length'
          :type='node.type'
          :name='node.name' 
          :key='node.name'>
        </Row>
      </div	>
    </div>
  </div>
</template>

<script>
import Row from './Row.vue';
import Pizzly from 'pizzly-js';
import GitTree from '../data_structures/GitTree.ts';
import { Octokit } from '@octokit/rest';

export default {
  name: 'MillerColumns',
  data: function() {
    const splitUrl = window.location.pathname.split('/');
    const ownerName = splitUrl[1] || '';
    const repoName = splitUrl[2] || '';
    const user = this.$cookies.get('user') || '';
    return {
      octokit: new Octokit({
        auth: process.env.VUE_APP_ACCESS_TOKEN,
      }),
      user: user,
      token: '',
      ownerName: ownerName,
      repoName: repoName,
      columns: [],
      wholeTree: [],
      lastCol: [],
      path: [],
      repositories: [],
      gitTree: new GitTree(this.ownerName, this.repoName),
    }
  },
  methods: {
    rowClicked: function(name, colIdx) {
      this.path[colIdx] = name;
      this.path.splice(colIdx + 1);

      // Set all columns' contents with the corresponding directory in the WholeTree 
      for (let i = 0; i < this.path.length; i++) {
        // TODO: There might be a big where this loops too far. It shouldn't always check the last node if its a file
        const prefixPath = this.path.slice(0, i);
        const column = this.getNodesAt(prefixPath).files;
        this.columns[i] = column;
      }
      this.columns = this.columns.splice(0, this.path.length);

      let selectedNode = this.getNodesAt(this.path);

      if (selectedNode.type == 'dir') {
        this.lastCol = selectedNode.files;
      } else {
        fetch(selectedNode.downloadUrl)
          .then(response => response.text())
          .then(data => this.$emit('display-code', data));
      }
    },
    /**
     * Given a list representing a path as such ['src', 'images', 'projects'], return
     * the tree at that node.
     */
    getNodesAt: function(dirNames) {
      try {
        return this.gitTree.lazyGet(dirNames)
      } catch (err) {
        console.err(err);
        if (err.name == 'APILimitError') {
          this.$emit('api-limit');
          return GitTree.empty();
        } else {
          throw err;
        }
      }
      // let currentDir = this.wholeTree;
      // for (let dirName of dirNames) {
      //   currentDir = currentDir.find(node => node.name == dirName);
      // }
      // return currentDir;
    },
    /**
     * Given a column index, returns a function that should be called with the path.
     * That way, a unique function is given to every row so that this component can know
     * which was clicked.
     */
    cbForColumnAt: function(colIdx) {
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

        /**
         * TODO: I named the funciton 'getNodesAt' plural because it returns a list
         * but I think that really, it should be called 'getNode' cause it could also be a file
         */
        let selectedNode = this.getNodesAt(this.path);

        if (selectedNode.type == 'dir') {
          this.lastCol = this.getNodesAt(this.path);
        } else {
          fetch(selectedNode.download_url)
            .then(response => response.text())
            .then(data => this.$emit('codeUpdate', data));
        }
      }
      return setPath.bind(this);
    },
    fetchRepo: function() {
      history.pushState({}, '', `/${this.ownerName}/${this.repoName}`);

      this.gitTree = new GitTree(this.ownerName, this.repoName, this.user);
      this.gitTree.init()
        .catch((err) => {
          if (err.name == 'APILimitError') {
            this.$emit('api-limit');
            return GitTree.empty();
          } else {
            throw err;
          }
        });
      // -----------
      // this.path = [];
      // this.columns = [];
      // this.lastCol = [];
      // this.fetchPath(this.ownerName, this.repoName, '', 5)
      //   .then( (fetchedTree) => { 
      //     this.wholeTree = fetchedTree;
      //     this.wholeTree.type = 'dir';
      //   });
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
    },
    connect: function() {
      // Here, we create a new method
      // that "connect" a user to GitHub
      this.$pizzly
        .integration('github')
        .connect()
        .then(this.connectSuccess)
        .catch(this.connectError);
    },
    connectSuccess: function(data) {
      // On success, we update the user object
      this.$emit('logged-in', data);
      this.user = data.authId;
      this.$cookies.set('user',data.authId);
      
      console.log('Successfully logged in!')
    },
    connectError: function (err) {
      console.error(err)
      alert('Something went wrong. Look at the logs.')
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
  mounted: function() {
    this.$pizzly = new Pizzly({
      host: 'https://git-columns-auth.herokuapp.com',
      publishableKey: 'ohNoYouSup3rH4x0rHowDidYouDoIt'
    });
    if (this.repoName != '') {
      this.fetchRepo();
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
    @extend .menu;
    min-height: 40vh;
    min-width: 33.3%;
  }
</style>