import GitTree from '../../src/data_structures/GitTree'

describe('Initialization', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules() // most important - it clears the cache
    process.env = { ...OLD_ENV }; // make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // restore old env
  });

  it('uses personal access key in developement', () => {
    console.log(process.env.VUE_APP_ACCESS_TOKEN);
    process.env.NODE_ENV = 'development';
    let tree = new GitTree('scott0129', 'git-miller');
    expect(tree.authMode).toBe('access_key');
  })

  it('uses app private key in production', () => {
    console.log(process.env.VUE_APP_ACCESS_TOKEN);
    process.env.NODE_ENV = 'production';
    let tree = new GitTree('scott0129', 'git-miller');
    expect(tree.authMode).toBe('app_key');
  })
})

describe('Path exploring', () => {
  it('lazily fetches', () => {
    let tree = new GitTree('scott0129', 'git-miller');
    expect(tree.depth).toBeLessThan(6);

    let oldDepth = tree.depth;
    let rootNode = tree.get([]);
    rootNode.right();
    expect(tree.depth).toBeGreaterThan(oldDepth);
    
    oldDepth = tree.depth;
    let path = ['frontend', 'src'];
    tree.get(path);
    expect(tree.depth).toBeGreaterThan(oldDepth);

  })

  it('correctly constructs tree with iterators', () => {
    let tree = new GitTree('scott0129', 'git-miller');
    let rootNode = tree.get([]);
    expect(rootNode.type).toBe('dir');

    let firstNode = rootNode.right();
    expect(rootNode.files).toContain(firstNode);
    expect(firstNode).not.toBe(firstNode.down());
  })

  it('has files in alphabetical order', () => {
    let tree = new GitTree('scott0129', 'git-miller');
    let rootFiles = tree.get([]).files;
    let sortedCopy = rootFiles.slice();

    sortedCopy.sort((a, b) => a.name.localeCompare(b.name));
    expect(rootFiles).toBe(sortedCopy);
  })
})
