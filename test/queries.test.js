const assert = require('chai').assert;
const H = require('./harness');

const ottoman = H.lib;

describe('Model Queries', function() {
  this.timeout(10000);

  function _queryTest(indexType, done) {
    const userModelId = H.uniqueId('model');
    const postModelId = H.uniqueId('model');

    const UserMdl = ottoman.model(
      userModelId,
      {
        name: 'string'
      },
      {
        queries: {
          topPosts: {
            type: indexType,
            of: postModelId,
            by: 'creator',
            consistency: ottoman.Consistency.GLOBAL
          }
        }
      }
    );
    const PostMdl = ottoman.model(postModelId, {
      creator: { ref: userModelId },
      msg: 'string'
    });

    ottoman.ensureIndices(function(err) {
      assert.isNull(err);

      const ux = new UserMdl();
      ux.name = 'Bob';
      const uy = new UserMdl();
      uy.name = 'Joe';

      const px1 = new PostMdl();
      px1.creator = ux;
      px1.msg = 'Bob Post 1';
      const px2 = new PostMdl();
      px2.creator = ux;
      px2.msg = 'Bob Post 2';
      const py1 = new PostMdl();
      py1.creator = uy;
      py1.msg = 'Joe Post 1';

      // Let index creation catch up.
      setTimeout(function() {
        H.saveAll([ux, uy, px1, px2, py1], function(err) {
          assert.isNull(err);

          ux.topPosts(function(err, res) {
            assert.isNull(err);
            assert.isArray(res);
            assert.propertyVal(res, 'length', 2);
            let objx1 = null;
            let objx2 = null;
            if (res[0]._id === px1._id) {
              objx1 = res[0];
              objx2 = res[1];
            } else if (res[0]._id === px2._id) {
              objx2 = res[0];
              objx1 = res[1];
            } else {
              assert.fail();
            }

            assert.equal(objx1._id, px1._id);
            assert.equal(objx1.msg, 'Bob Post 1');
            assert.equal(objx2._id, px2._id);
            assert.equal(objx2.msg, 'Bob Post 2');
            done();
          });
        });
      }, 1000);
    });
  }

  it('should perform default type queries successfully', function(done) {
    _queryTest.call(this, undefined, done);
  });
  it('should perform view type queries successfully', function(done) {
    _queryTest.call(this, 'view', done);
  });
  it('should perform n1ql type queries successfully', function(done) {
    _queryTest.call(this, 'n1ql', done);
  });

  it('should fail queries where the other type is not registered', function(done) {
    const userModelId = H.uniqueId('model');
    const postModelId = H.uniqueId('model');
    const UserMdl = ottoman.model(
      userModelId,
      {
        name: 'string'
      },
      {
        queries: {
          topPosts: {
            type: 'view',
            of: postModelId,
            by: 'creator'
          }
        }
      }
    );

    ottoman.ensureIndices(function(err) {
      assert.isNull(err);

      // Let index creation catch up.
      setTimeout(function() {
        const ux = new UserMdl();
        ux.name = 'Bob';

        ux.save(function(err) {
          assert.isNull(err);

          assert.throw(function() {
            ux.topPosts(function() {
              assert.fail();
            });
          }, Error);

          done();
        });
      }, 1000);
    });
  });
});
