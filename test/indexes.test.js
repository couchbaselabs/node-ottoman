var assert = require('chai').assert;
var H = require('./harness');
var ottoman = H.lib;

describe('Model Indexes', function() {

  function _indexTest(indexType, done) {
    var modelId = H.uniqueId('model');

    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    }, {
      index: {
        findByName: {
          type: indexType,
          by: 'name'
        }
      }
    });

    ottoman.ensureIndices(function(err) {
      assert.isNull(err);

      var x = new TestMdl();
      x.name = 'Frank';
      var y = new TestMdl();
      y.name = 'George';

      x.save(function(err) {
        assert.isNull(err);
        y.save(function(err) {
          assert.isNull(err);

          TestMdl.findByName('Frank', function(err, res) {
            assert.isNull(err);
            assert.isArray(res);
            assert.propertyVal(res, 'length', 1);
            var obj = res[0];
            assert.equal(obj._id, x._id);
            assert.equal(obj.name, 'Frank');
            done();
          });
        });
      });
    });
  }
  it('should perform view string indexing successfully', function(done) {
    _indexTest.call(this, 'view', done);
  });
  it('should perform string indexing successfully', function(done) {
    _indexTest.call(this, 'refdoc', done);
  });

});
