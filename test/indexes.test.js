const assert = require('chai').assert;
const H = require('./harness');

const ottoman = H.lib;

describe('Model Indexes', function() {
  // Add timeout to permit CI tests to take some time.
  this.timeout(10000);

  function _indexTest(indexType, done) {
    const modelId = H.uniqueId('model');

    const TestMdl = ottoman.model(
      modelId,
      {
        name: 'string',
        company: 'string'
      },
      {
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
      }
    );

    ottoman.ensureIndices(function(err) {
      assert.isNull(err);

      const x = new TestMdl();
      x.name = 'Frank';
      x.company = 'Couchbase';
      const y = new TestMdl();
      y.name = 'George';
      y.company = 'Google';

      x.save(function(err) {
        assert.isNull(err);
        y.save(function(err) {
          assert.isNull(err);
          // Not pretty; but for n1ql indexes, this sometimes executes too fast
          // before indices are in full ready state on the DB.  If n1ql tests
          // in particular executes before indexes are ready, results come back
          // empty [] and the test fails, which is a red herring.
          setTimeout(function() {
            TestMdl.findByName('Frank', function(err, res) {
              assert.isNull(err);
              assert.isArray(res);
              assert.propertyVal(res, 'length', 1);
              const obj = res[0];
              assert.equal(obj._id, x._id);
              assert.equal(obj.name, 'Frank');
              assert.equal(obj.company, 'Couchbase');
              done();
            });
          }, 1000);
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

  if (ottoman.store instanceof ottoman.CbStoreAdapter) {
    it('should create index on _type when indexing for n1ql', function(done) {
      const couchbase = require('couchbase');

      _indexTest.call(this, 'n1ql', function() {
        // At this point, all GSI indexes should have been made, meaning there
        // should be one on type.
        const verifyQ =
          `${'SELECT * FROM system:indexes WHERE ' + "keyspace_id='"}${
            ottoman.bucket._name
          }' AND ` +
          `(ARRAY_CONTAINS(index_key, '\`_type\`') OR ` +
          `ARRAY_CONTAINS(index_key, '_type'))`;

        ottoman.bucket.query(couchbase.N1qlQuery.fromString(verifyQ), function(
          err,
          rows
        ) {
          if (err) {
            return done(err);
          }

          // If we got anything back, then the appropriate index exists.
          assert.isAtLeast(rows.length, 1);
          done();
        });
      });
    });
  }

  it('should fail to have two identical refdoc keys', function(done) {
    const modelId = H.uniqueId('model');

    const TestMdl = ottoman.model(
      modelId,
      {
        name: 'string',
        company: 'string'
      },
      {
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
      }
    );

    ottoman.ensureIndices(function(err) {
      assert.isNull(err);

      const x = new TestMdl();
      x.name = 'Frank';
      x.company = 'Couchbase';
      const y = new TestMdl();
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

  it('should allow two paths with the same name when undefined', function(done) {
    const modelId = H.uniqueId('model');

    const TestMdl = ottoman.model(
      modelId,
      {
        name: 'string',
        company: 'string'
      },
      {
        index: {
          findByNameAndCompany: {
            type: 'refdoc',
            by: ['name', 'company']
          }
        }
      }
    );

    ottoman.ensureIndices(function(err) {
      assert.isNull(err);

      const x = new TestMdl();
      x.name = 'Frank';
      const y = new TestMdl();
      y.company = 'Frank';

      x.save(function(err) {
        assert.isNull(err);

        y.save(function(err) {
          assert.isNull(err);
          done();
        });
      });
    });
  });

  it('should be ok to have two refdocs both undefined', function(done) {
    const modelId = H.uniqueId('model');

    const TestMdl = ottoman.model(
      modelId,
      {
        name: 'string',
        company: 'string'
      },
      {
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
      }
    );

    ottoman.ensureIndices(function(err) {
      assert.isNull(err);

      const x = new TestMdl();
      x.name = 'Frank';
      const y = new TestMdl();
      y.name = 'George';

      x.save(function(err) {
        assert.isNull(err);

        y.save(function(err) {
          assert.isNull(err);
          done();
        });
      });
    });
  });

  it('should succeed with a previously changed refdoc key', function(done) {
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(
      modelId,
      {
        name: 'string',
        company: 'string'
      },
      {
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
      }
    );

    ottoman.ensureIndices(function(err) {
      assert.isNull(err);

      const x = new TestMdl();
      x.name = 'Frank';
      x.company = 'Couchbase';
      const y = new TestMdl();
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
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(
      modelId,
      {
        name: 'string'
      },
      {
        index: {
          findByName: {
            type: 'refdoc',
            by: 'name'
          }
        }
      }
    );

    ottoman.ensureIndices(function(err) {
      assert.isNull(err);

      const x = new TestMdl();
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
    const ottoX = new ottoman.Ottoman();
    ottoX.store = ottoman.store;

    const modelId = H.uniqueId('model');
    ottoX.model(
      modelId,
      {
        name: 'string'
      },
      {
        index: {
          findByName: {
            type: 'INVALID INDEX',
            by: 'name'
          }
        }
      }
    );

    ottoX.ensureIndices(function(err) {
      assert.isNotNull(err);
      done();
    });
  });

  it('should fail to search with an invalid index type', function(done) {
    const ottoX = new ottoman.Ottoman();
    ottoX.store = ottoman.store;

    const modelId = H.uniqueId('model');
    const TestMdl = ottoX.model(
      modelId,
      {
        name: 'string'
      },
      {
        index: {
          findByName: {
            type: 'INVALID INDEX',
            by: 'name'
          }
        }
      }
    );

    TestMdl.findByName('', function(err, res) {
      assert.isNotNull(err);
      assert.isNull(res);
      done();
    });
  });
});
