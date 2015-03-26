var assert = require('chai').assert;
var H = require('./harness');
var ottoman = H.lib;

describe('Model Indexes', function() {

  it('should perform view string indexing successfully', function(done) {
    var modelId = H.uniqueId('model');

    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    }, {
      index: {
        findByName: {
          type: 'view',
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
  });

  it('should perform refdoc string indexing successfully', function(done) {
    var modelId = H.uniqueId('model');

    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    }, {
      index: {
        findByName: {
          type: 'refdoc',
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
  });

});
