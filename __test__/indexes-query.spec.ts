import { Schema, model, ensureIndexes } from '../lib';

const generateMockData = async () => {
  const userSchema = new Schema({
    name: String,
  });
  userSchema.queries = {
    myPosts: {
      of: 'Post',
      by: 'user',
    },
  };
  const User = model('User', userSchema);
  const postSchema = new Schema({
    user: { type: userSchema, ref: 'User' },
    title: String,
    body: String,
  });
  const Post = model('Post', postSchema);
  const user = new User({ name: 'ottoman-user' });
  await user.save();
  const post = new Post({
    title: 'The new post',
    body: 'This is my new post',
    user: user.id,
  });
  await post.save();
  await ensureIndexes();
  return { user, post };
};

describe('Mode Query Index Tests', () => {
  test('Test schema query structure', async () => {
    const { user } = await generateMockData();
    const results = await user.myPosts();
    expect(results.rows).toBeDefined();
    expect(results.rows.length > 0).toBeTruthy();
    expect(results.rows[0].user).toBe(user.id);
  });

  test('Test schema query check wrong structure', async () => {
    const run = () => {
      const userSchema = new Schema({
        name: String,
      });
      userSchema.queries = {
        myPosts: {
          off: 'Post',
          by: 'user',
        },
      };
      const User = model('User', userSchema);
      new User({ name: 'ottoman-user' });
    };
    expect(run).toThrow('The "by" and "of" properties are required to build the queries.');
  });

  test('Test schema query not register model exception', async () => {
    const run = () => {
      const userSchema = new Schema({
        name: String,
      });
      userSchema.queries = {
        myPosts: {
          of: 'News',
          by: 'user',
        },
      };
      const User = model('User', userSchema);
      new User({ name: 'ottoman-user-test' });
    };
    expect(run).toThrow('Collection News does not exist.');
  });
});
