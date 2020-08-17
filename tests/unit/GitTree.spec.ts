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

    let rootNode = await tree.get([]);
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
    let rootNode = await tree.get([]);
    let nextNode = rootNode.right();
    await nextNode.touch();
    expect(tree.depth()).toBeGreaterThan(oldDepth);
    
    oldDepth = tree.depth();
    let path = ['frontend', 'src'];
    await tree.get(path);
    expect(tree.depth()).toBeGreaterThan(oldDepth);

  })

  it('has files in alphabetical order', async () => {
    let tree = new GitTree('scott0129', 'git-miller', token);
    await tree.init();
    let rootNode = await tree.get([]);
    let filenames = [];
    for (const file of rootNode.files!) {
      if (file.type == 'file') {
        filenames.push(file.name);
      }
    }

    let sortedCopy = filenames!.slice();
    sortedCopy.sort();

    expect(filenames).toEqual(sortedCopy);
  })
})
