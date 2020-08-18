<template>
  <div class='d-block'>
    <div v-if='!user'>
      <button @click.prevent='connect'>Connect to GitHub</button>
    </div>
    <form>
      <input v-model='ownerName' placeholder='owner'>
      <input v-model='repoName' placeholder='repo'>
      <button v-on:click='fetchRepo'>Get</button>
    </form>

    <div id='file-browser' class='Box mx-auto d-flex flex-row' style='overflow: scroll; max-width: 100%'>
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
      {{/* TODO: Consider refactoring, cutting down volatileGet() to a single call. Not sure how to do it well though */}}
      <div v-if='this.gitTree.volatileGet(path).type == "dir"' id='last-col' class='miller-col' style='max-height: 80vh; overflow: scroll'>
        <Row 
          v-for='node in this.gitTree.volatileGet(path).files' 
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

<script lang='javascript'>
import Row from './Row.vue';
import Pizzly from 'pizzly-js';
import GitTree from '../data_structures/GitTree.ts';

export default {
  name: 'MillerColumns',
  data: function() {
    const splitUrl = window.location.pathname.split('/');
    const ownerName = splitUrl[1] || '';
    const repoName = splitUrl[2] || '';
    const user = this.$cookies.get('user') || '';
    return {
      user: user,
      token: '',
      ownerName: ownerName,
      repoName: repoName,
      columns: [],
      path: [],
      gitTree: new GitTree(ownerName, repoName),
    }
  },
  methods: {
    scrollRight: function() {
      const millerWindow = document.getElementById('file-browser');
      millerWindow.scroll({
        top: 0,
        left: millerWindow.scrollWidth,
        behavior: 'smooth'
      })
    },
    
    rowClicked: function(name, colIdx) {
      this.path[colIdx] = name;
      this.path.splice(colIdx + 1);

      // Set all columns' contents with the corresponding directory in the WholeTree 
      for (let i = 0; i < this.path.length; i++) {
        // TODO: There might be a big where this loops too far. It shouldn't always check the last node if its a file
        const prefixPath = this.path.slice(0, i);
        const column = this.gitTree.volatileGet(prefixPath).files;
        this.columns[i] = column;
      }
      this.columns = this.columns.splice(0, this.path.length);

      let selectedNode = this.gitTree.volatileGet(this.path);

      selectedNode.touch()
        .catch((err) => {
          console.err(err);
          if (err.name == 'APILimitError') {
            this.$emit('api-limit');
            return GitTree.empty();
          } else {
            throw err;
          }
        });

      if (selectedNode.type != 'dir') {
        selectedNode.getFile()
          .then(contents => this.$emit('display-code', contents));
      }

    },

    fetchRepo: function() {
      this.path = [];
      this.columns = [];

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
      alert('Something went wrong! Couldn\'t log you in')
    }
  }, 
  updated: function() {
    this.scrollRight();
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