import { Octokit } from '@octokit/rest';
import Pizzly from 'pizzly-js';

/**
 * Like an inode, but for Github trees
 */
class Gnode {
  
  authInfo: {
    pizzly: Pizzly;
    octokit: Octokit,
    token: string,
    owner: string,
    repo: string,
  }

  parent: Gnode | null;

  name: string;
  path: string;
  type: string;

  // File-only properties
  size: number // dir's have size zero
  downloadUrl: string | null;
  isDownloaded: boolean;
  contents: string;

  // Directory-only properties
  files: Array<Gnode> | undefined;
  isLoaded: boolean     // True iff files have been loaded

  isRoot: boolean;

  constructor(authInfo: any, parent: Gnode | null, data: any, isRoot?: boolean) {

    this.authInfo = authInfo;
    this.parent = parent;

    this.name = data.name;
    this.path = data.path;
    this.type = data.type;

    this.size = data.size;
    this.downloadUrl = data.download_url;
    this.isDownloaded = false;
    this.contents = '';

    this.isLoaded = false;
    this.files = []; // Files are undefined until load() is called

    this.isRoot = isRoot || false;

  }

  static empty() {
    return new Gnode(
      {},
      null,
      {
        name: 'PLACEHOLDER',
        path: 'PLACEHOLDER',
        type: 'dir',
        size: 0,
        files: [],
        download_url: 'PLACEHOLDER',
      }
    )
  }

  /**
   * Each direction up/down/left/right returns the Gnode as if it was using
   * arrow keys for miller-column file navigation.
   * 
   * This also means that it will sometimes return itself
   * i.e. If we've reached the end of a list
   */
  up() {
    const siblings = this.parent!.files!;
    const thisIdx = siblings.indexOf(this)
    if (siblings[thisIdx - 1]) { siblings[thisIdx - 1] }
    else { return this }
  }

  down() {
    const siblings = this.parent!.files!;
    const thisIdx = siblings.indexOf(this)
    if (siblings[thisIdx + 1]) { siblings[thisIdx + 1] }
    else { return this }
  }

  left() {
    if (this.parent && !this.parent.isRoot) { return this.parent }
    else { return this }
  }

  right() {
    if (this.type == 'dir' && this.files![0]) {
      this.files![0].touch();
      return this.files![0];
    } else {
      return this;
    }
  }

  async getFile() { 
    if (this.isDownloaded) {
      return this.contents;
    }
    if (this.downloadUrl) {
      return fetch(this.downloadUrl)
        .then(response => response.text())
        .then(contents => {
          this.contents = contents;
          this.isDownloaded = true;
          return contents;
        });
    } else {
      throw `This file doesn't have a downloadUrl! Are you trying to load a directory? Gnode type: ${this.type}` 
    }
  }

  /**
   * returns a number that represents its distance from farthest unloaded
   * node. If all is well, all sibling nodes should have the same depth.
   */
  depth() {
    if (!this.isLoaded || this.type != 'dir') { return 0; }

    let deepestChild = -1;
    for (const node of this.files!) {
      if (node.type == 'dir') {
        const child = node.depth();
        if (child > deepestChild) {
          deepestChild = child;
        }
      }
    }

    return deepestChild + 1;
  }

  /**
   * Calling this function makes sure that this and the next 3 levels down in the
   * file structure are loaded
   */
  async touch() {
    await this.load(3)
      .catch((err) => {
        if (err.status == 403 && err.headers['x-ratelimit-remaining'] == '0') {
          throw {
            name: 'APILimitError',
            message: 'API limit hit for the Github API!'
          };
        } else {
          throw(err);
        }
      })
  }

  private async fetchContents(owner: string, repo: string, path: string, token?: string) {
    if (token) {
      return this.authInfo.pizzly
        .integration('github')
        .auth(this.authInfo.token)
        .get(`/repos/${owner}/${repo}/contents/${this.path}`)
        .then((res: Response) => res.json());
    } else {
      return this.authInfo.octokit.repos.getContent({
        owner: owner,
        repo: repo,
        path: path,
      }).then((res) => res.data)
    }
  }

  /**
   * A recursive function to load all the data to some depth
   */
  private async load(depth: number) {
    if (depth < 0 || this.type != 'dir') {
      return;
    }
    if (this.isLoaded) {
      for (const node of this.files!) {
        if (node.type == 'dir') {
          await node.load(depth - 1);
        }
      }
      return;
    }

    this.files = [];

    const data = await this.fetchContents(
        this.authInfo.owner,
        this.authInfo.repo,
        this.path,
        this.authInfo.token)

    // Create new Gnodes, while loading new ones.
    for (const nodeData of data) {
      const newNode = new Gnode(this.authInfo, this, nodeData)
      if (newNode.type == 'dir') {
        await newNode.load(depth - 1)
      }
      this.files!.push(newNode)
    }

    // Sort the files into alphabetical order, but always put directories first
    this.files!.sort(this.fileCompare);

    this.isLoaded = true;
  }

  private fileCompare(a: Gnode, b	: Gnode) {
    if (a.type == b.type) {
        if (a.name < b.name) {
          return -1
        } else if (a.name > b.name) {
          return 1;
        } else {
          return 0
        }
      } else if (a.type == 'dir') {
        return -1;
      } else {
        return 1;
      }
  }
}

export default Gnode;