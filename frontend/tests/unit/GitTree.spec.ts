import GitTree from '../../src/data_structures/GitTree';
const secrets = require('./.env');

describe('Initialization', () => {
  it('uses personal access key in developement', () => {
    console.log(GitTree);
    const token = secrets.PERSONAL_ACCESS_TOKEN;
    let tree = new GitTree('scott0129', 'git-miller', token);
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

    sortedCopy.sort((a: any, b: any) => a.name.localeCompare(b.name));
    expect(rootFiles).toBe(sortedCopy);
  })
})
