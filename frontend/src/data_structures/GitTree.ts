const { Octokit } = require('@octokit/rest');

class GitTree {
  octokit: Object;
  authMode: string;
  depth: number;

  constructor(owner, repo) {

    if (process.env.NODE_ENV == 'production') {
      this.octokit = new Octokit({
        auth: process.env.VUE_APP_ACCESS_TOKEN,
      });
      this.authMode = 'app_key';
    } else {
      this.octokit = new Octokit({
        auth: process.env.VUE_APP_ACCESS_TOKEN,
      }),
      this.authMode = 'access_key';
    }
  }

  /**
   * Like an inode, but for Github trees
   */
  static Gnode = class {
    name: string;
    type: string;
    files: Array<this>;
    constructor() {}
    right() {
      return new GitTree.Gnode();
    }
    down() {
      return new GitTree.Gnode();
    }
  }

  get(path) {
    return new GitTree.Gnode();
  }

}


export default GitTree;