const GitTree = require('../../src/data_structures/GitTree')

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
    const authId = process.env.MY_AUTH_ID;
    console.log(authId);
    let tree = new GitTree('scott0129', 'git-miller', authId);
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

























































