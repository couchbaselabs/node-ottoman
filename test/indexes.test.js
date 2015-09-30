var assert = require('chai').assert;
var H = require('./harness');
var ottoman = H.lib;

describe('Model Indexes', function() {

  function _indexTest(indexType, done) {
    var modelId = H.uniqueId('model');

    var TestMdl = ottoman.model(modelId, {
      name: 'string',
      company: 'string'
    }, {
      index: {
        findByName: {
          type: indexType,
          by: 'name',
          consistency: ottoman.Consistency.GLOBAL
        },
        findByCompany: {
          type: indexType,
          by: 'company',
          consistency: ottoman.Consistency.GLOBAL
        }
      }
    });

    ottoman.ensureIndices(function(err) {
      assert.isNull(err);

      var x = new TestMdl();
      x.name = 'Frank';
      x.company = 'Couchbase';
      var y = new TestMdl();
      y.name = 'George';
      y.company = 'Google';

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
            assert.equal(obj.company, 'Couchbase');
            done();
          });
        });
      });
    });
  }
  it('should perform default string indexing successfully', function(done) {
    _indexTest.call(this, undefined, done);
  });
  it('should perform view string indexing successfully', function(done) {
    _indexTest.call(this, 'view', done);
  });
  it('should perform refdoc string indexing successfully', function(done) {
    _indexTest.call(this, 'refdoc', done);
  });
  it('should perform n1ql string indexing successfully', function(done) {
    _indexTest.call(this, 'n1ql', done);
  });

  it('should fail to have two identical refdoc keys', function(done) {
    var modelId = H.uniqueId('model');

    var TestMdl = ottoman.model(modelId, {
      name: 'string',
      company: 'string'
    }, {
      index: {
        findByName: {
          type: 'refdoc',
          by: 'name'
        },
        findByCompany: {
          type: 'refdoc',
          by: 'company'
        }
      }
    });

    ottoman.ensureIndices(function(err) {
      assert.isNull(err);

      var x = new TestMdl();
      x.name = 'Frank';
      x.company = 'Couchbase';
      var y = new TestMdl();
      y.name = 'George';
      y.company = 'Couchbase';

      x.save(function(err) {
        assert.isNull(err);

        y.save(function(err) {
          assert.isNotNull(err);
          done();
        });
      });
    });
  });

  it('should succeed with a previously changed refdoc key', function(done) {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string',
      company: 'string'
    }, {
      index: {
        findByName: {
          type: 'refdoc',
          by: 'name'
        },
        findByCompany: {
          type: 'refdoc',
          by: 'company'
        }
      }
    });

    ottoman.ensureIndices(function(err) {
      assert.isNull(err);

      var x = new TestMdl();
      x.name = 'Frank';
      x.company = 'Couchbase';
      var y = new TestMdl();
      y.name = 'Frank';
      y.company = 'Google';

      x.save(function(err) {
        assert.isNull(err);

        x.name = 'George';
        x.save(function(err) {
          assert.isNull(err);

          y.save(function(err) {
            assert.isNull(err);

            y.name = 'Bob';
            y.company = 'VMWare';
            y.save(function(err) {
              assert.isNull(err);

              done();
            });
          });
        });
      });
    });
  });

  it('should fail for a missing refdoc value', function(done) {
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

      x.save(function(err) {
        assert.isNull(err);

        TestMdl.findByName('George', function(err, res) {
          assert.isNull(err);
          assert.isArray(res);
          assert.propertyVal(res, 'length', 0);

          done();
        });
      });
    });
  });

  it('should fail to ensureIndex with an invalid index type', function(done) {
    var ottoX = new ottoman.Ottoman();
    ottoX.store = ottoman.store;

    var modelId = H.uniqueId('model');
    var TestMdl = ottoX.model(modelId, {
      name: 'string'
    }, {
      index: {
        findByName: {
          type: 'INVALID INDEX',
          by: 'name'
        }
      }
    });

    ottoX.ensureIndices(function(err) {
      assert.isNotNull(err);
      done();
    });
  });

  it('should fail to search with an invalid index type', function(done) {
    var ottoX = new ottoman.Ottoman();
    ottoX.store = ottoman.store;

    var modelId = H.uniqueId('model');
    var TestMdl = ottoX.model(modelId, {
      name: 'string'
    }, {
      index: {
        findByName: {
          type: 'INVALID INDEX',
          by: 'name'
        }
      }
    });

    TestMdl.findByName('', function(err, res) {
      assert.isNotNull(err);
      assert.isNull(res);
      done();
    });
  });

});
