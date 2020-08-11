const { Octokit } = require('@octokit/rest');

class GitTree {
  octokit: Object;
  authMode: String;

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
}

export default GitTree;