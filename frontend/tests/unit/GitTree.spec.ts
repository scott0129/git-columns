import GitTree from '../../src/data_structures/GitTree';
const secrets = require('./.env');
const token = secrets.PERSONAL_ACCESS_TOKEN;

describe('Initialization', () => {
  it('doesn\'t immediately crash', async () => {
    let tree = new GitTree('scott0129', 'git-miller', token);
    await tree.init();
  })
})

describe('Path exploring', () => {
  it('constructs tree with iterators', async () => {
    let tree = new GitTree('scott0129', 'git-miller', token);
    await tree.init();
    console.log("finished init!");

    let rootNode = tree.get([]);
    expect(rootNode.type).toBe('dir');

    let firstNode = rootNode.right();
    expect(rootNode.files).toContain(firstNode);
    expect(firstNode).not.toBe(firstNode.down());
  })

  it('lazily fetches', async () => {
    let tree = new GitTree('scott0129', 'git-miller', token);
    await tree.init();
    expect(tree.depth()).toBeLessThan(6);

    let oldDepth = tree.depth();
    let rootNode = tree.get([]);
    rootNode.right();
    expect(tree.depth()).toBeGreaterThan(oldDepth);
    
    oldDepth = tree.depth();
    let path = ['frontend', 'src'];
    tree.get(path);
    expect(tree.depth()).toBeGreaterThan(oldDepth);

  })

  it('has files in alphabetical order', async () => {
    let tree = new GitTree('scott0129', 'git-miller', token);
    await tree.init();
    let rootFiles = tree.get([]).files;

    let sortedCopy = rootFiles!.slice();

    sortedCopy.sort((a: any, b: any) => a.name.localeCompare(b.name));
    expect(rootFiles).toBe(sortedCopy);
  })
})
