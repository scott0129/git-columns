const { Octokit } = require('@octokit/rest');

/**
 * Like an inode, but for Github trees
 */
class Gnode {
  
  authInfo: {
    octokit: typeof Octokit,
    owner: string;
    repo: string;
  }

  parent: Gnode | null;

  name: string;
  path: string;
  type: string;

  // File-only properties
  size: number // dir's have size zero
  downloadUrl: string | null;

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

    this.isLoaded = false;
    this.files = undefined; // Files are undefined until load() is called

    this.isRoot = isRoot || false;
  }

  /**
   * Each direction up/down/left/right returns the Gnode as if it was using
   * arrow keys for miller-column file navigation.
   * 
   * This also means that it will sometimes return itself
   * i.e. If we've reached the end of a list
   */
  up() {
    let siblings = this.parent!.files!;
    let thisIdx = siblings.indexOf(this)
    if (siblings[thisIdx - 1]) { siblings[thisIdx - 1] }
    else { return this }
  }

  down() {
    let siblings = this.parent!.files!;
    let thisIdx = siblings.indexOf(this)
    if (siblings[thisIdx + 1]) { siblings[thisIdx + 1] }
    else { return this }
  }

  left() {
    if (this.parent && !this.parent.isRoot) { return this.parent }
    else { return this };
  }

  right() {
    if (this.type == 'dir' && this.files![0]) {
      this.files![0].touch();
      return this.files![0];
    } else {
      return this;
    }
  }

  /**
   * returns a number that represents its distance from farthest unloaded
   * node. If all is well, all sibling nodes should have the same depth.
   */
  depth() {
    if (!this.isLoaded || this.type != 'dir') { return 0; }

    let deepestChild = -1;
    for (let node of this.files!) {
      if (node.type == 'dir') {
        let child = node.depth();
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
          //TODO Catch emit ratelimiting error and display something on Vue
          console.error("Rate limiting hit!");
        } else {
          throw(err);
        }
      })
  }

  /**
   * A recursive function to load all the data to some depth
   */
  private async load(depth: number) {
    if (depth < 0 || this.type != 'dir') {
      return;
    }
    if (this.isLoaded) {
      for (let node of this.files!) {
        if (node.type == 'dir') {
          await node.load(depth - 1);
        }
      }
      return;
    }

    this.files = [];

    let res = await this.authInfo.octokit.repos.getContent({
      owner: this.authInfo.owner,
      repo: this.authInfo.repo,
      path: this.path,
    })
    
    // Create new Gnodes, while loading new ones.
    for (let nodeData of res.data) {
      let newNode = new Gnode(this.authInfo, this, nodeData)
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