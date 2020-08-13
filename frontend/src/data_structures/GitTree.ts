const { Octokit } = require('@octokit/rest');

class GitTree {
  octokit: typeof Octokit;
  depth: number;
  github: any;
  root: Gnode;
  token: string | undefined;

  constructor(owner: string, repo: string, token?: string) {
    this.octokit = new Octokit({
      auth: process.env.VUE_APP_ACCESS_TOKEN,
    }),

    this.depth = 0;
    this.root = new Gnode();
  }


  get(path: Array<string>) {
    return new Gnode();
  }
}

/**
 * Like an inode, but for Github trees
 */
class Gnode {
  name: string;
  type: string;
  files: Array<this>;
  constructor() {
    this.name = '';
    this.type = '';
    this.files = [];
  }
  right() {
    return new Gnode();
  }
  down() {
    return new Gnode();
  }
}

export default GitTree;