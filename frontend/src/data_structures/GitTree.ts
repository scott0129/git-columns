const Pizzly = require('pizzly-js');

class GitTree {
  depth: number;
  github: any;
  root: Gnode;
  authId?: string;

  constructor(owner: string, repo: string, authId?: string) {
    if (authId) {
      this.authId = authId;
      this.github = new Pizzly({
        host: 'https://git-columns-auth.herokuapp.com',
        publishableKey: 'ohNoYouSup3rH4x0rHowDidYouDoIt'
      }).integration('github');
    }

    this.github
      .auth(authId)
      .get(`/repos/${owner}/${repo}/branches/master`)
      .then((response:any) => console.log(response))
      .catch(console.error)

    this.github
      .auth(authId)
      .get(`/repos/${owner}/${repo}`)

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



















































































































