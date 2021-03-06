import Gnode from './Gnode';
import { Octokit } from '@octokit/rest';
import Pizzly from 'pizzly-js';

class GitTree {

  octokit: Octokit;
  pizzly: Pizzly;

  root: Gnode; 
  github: any;
  owner: string;
  repo: string;
  token: string | undefined;

  constructor(owner: string, repo: string, token?: string) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;

    this.octokit = new Octokit();
    this.pizzly = new Pizzly({
      host: 'https://git-columns-auth.herokuapp.com',
      publishableKey: 'ohNoYouSup3rH4x0rHowDidYouDoIt'
    });

    const authInfo = {
                    octokit: this.octokit,
                    pizzly: this.pizzly,
                    token: token, 
                    owner: owner, 
                    repo: repo};
    
    this.root = new Gnode(
      authInfo,
      null,
      { name: '',
        path: '',
        type: 'dir',
        size: 0,
        downloadUrl: null },
      true)


    
    /* TODO: This below is if I ever use octokit getTree() instead, which */
    /* could save on a lot of API calls but also mean a lot more edge-cases */

    /* this.octokit.repos.getBranch({ */
    /*   owner: owner, */
    /*   repo: repo, */
    /*   branch: 'master', */
    /* }).then( (res: any) => { */
    /*   let treeSha = res.data.commit.sha; */
    /*   return this.octokit.git.getTree({ */
    /*     owner: owner, */
    /*     repo: repo, */
    /*     tree_sha: treeSha, */
    /*     recursive: true, */
    /*   }); */
    /* }).then( (res: any) => { */
    /*   console.log(res.data.tree); */
    /* }) */
  }

  async init() {
    await this.root.touch();
  }

  static empty() {
    return Gnode.empty()
  }

  depth(): number {
    return this.root.depth();
  }

  /**
   * This gets the file at the given path
   * It's volatile because although it doesn't guarantee the file is/isnt there,
   * it's the fastest way to get any currently loaded structure so far.
   * 
   * This function alone never makes network requests
   */
  volatileGet(path: Array<string>) {
    let currentNode: Gnode | undefined;
    currentNode = this.root;
    for (const name of path) {
      if (!currentNode.files) {
        return Gnode.empty();
      }
      currentNode = currentNode.files.find((node) => node.name == name)
      if (!currentNode) {
        return Gnode.empty();
      }
    }
    return currentNode;
  }

  lazyGet(path: Array<string>) {
    let currentNode: Gnode | undefined;
    currentNode = this.root;
    for (const name of path) {
      currentNode = currentNode.files!.find((node) => node.name == name)
      if (!currentNode) {
        return Gnode.empty();
      }
      currentNode.touch();
    }
    return currentNode;
  }

  async get(path: Array<string>) {
    let currentNode: Gnode | undefined;
    currentNode = this.root;
    for (const name of path) {
      currentNode = currentNode.files!.find((node) => node.name == name)
      if (currentNode == undefined || currentNode.files == undefined) {
        throw `Path "${path.join('/')}" does not exist. Or it's a bug I made. Probably the latter.`
      }
      if (!currentNode.isLoaded) {
        await currentNode.touch();
      }
    }
    return currentNode;
  }
}


export default GitTree;