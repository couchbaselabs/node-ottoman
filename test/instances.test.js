const chai = require('chai');

const expect = chai.expect;
const H = require('./harness');

const ottoman = H.lib;

describe('Model Instances', function() {
  const modelId = H.uniqueId('model');
  const TestMdl = ottoman.model(modelId, {
    name: 'string'
  });
  const testInstance = new TestMdl({ name: 'Joe Blow' });

  before(function(done) {
    ottoman.ensureIndices(function(err) {
      if (err) {
        return done(err);
      }

      // Guarantee at least one saved.
      testInstance.save(function(err) {
        return done(err);
      });
    });
  });

  const modelId2 = H.uniqueId('model');
  const IdTestModel = ottoman.model(
    modelId2,
    {
      myId: { type: 'string', auto: 'uuid', readonly: true },
      name: 'string'
    },
    {
      id: 'myId'
    }
  );

  const testIdInstance = new IdTestModel({ name: 'Jane Smith' });

  it('should know its id', function(done) {
    const id = testInstance.id();
    expect(id).to.be.ok;
    done();
  });

  it('should respect user setting a different ID fields', function(done) {
    const id = testIdInstance.id();

    expect(id).to.be.ok;
    expect(id).to.equal(testIdInstance.myId);
    done();
  });

  if (ottoman.store instanceof ottoman.CbStoreAdapter) {
    it('should have a working find function', function(done) {
      TestMdl.find({ name: 'Joe Blow' }, {}, function(err, items) {
        if (err) {
          return done(err);
        }

        expect(items).to.be.an('Array');
        done();
      });
    });

    it('should have a working count function', function(done) {
      TestMdl.count({ name: 'Joe Blow' }, {}, function(err, count) {
        if (err) {
          return done(err);
        }

        expect(count).to.be.an('number');
        done();
      });
    });
  }

  it('should have a toJSON function', function(done) {
    const json = testInstance.toJSON();

    expect(json).to.be.ok;
    expect(json.name).to.equal('Joe Blow');

    // Should have an ID and a name field only.
    expect(Object.keys(json).length).to.equal(2);
    done();
  });

  it('should permit using ModelInstance.create', function(done) {
    TestMdl.create({ name: 'Jack Sparrow' }, function(err, modelInst) {
      expect(modelInst).to.be.ok;
      expect(modelInst.name).to.equal('Jack Sparrow');
      done();
    });
  });

  it('should support loadAll', function(done) {
    const ids = [];

    function createDummies(cb) {
      let created = 0;

      function makeDummy(cb) {
        if (created === 10) {
          return cb(null);
        }

        const mi = new TestMdl({ name: `Test ${created}` });

        mi.save(function(err) {
          if (err) {
            return cb(err);
          }

          created++;
          // console.log('Pushing ' + mi.id());
          ids.push(mi.id());

          return makeDummy(cb);
        });
      }

      makeDummy(cb);
    }

    createDummies(function(err) {
      if (err) {
        return done(err);
      }

      let toLoad = [];

      for (let i = 0; i < 10; i++) {
        const v = TestMdl.ref(ids[i]);
        toLoad = toLoad.concat([v]);
      }

      TestMdl.loadAll(toLoad, function(err) {
        if (err) {
          return done(err);
        }

        expect(toLoad.length).to.equal(10);

        for (let z = 0; z < 10; z++) {
          expect(toLoad[z]).to.be.an('object');
          expect(toLoad[z].name).to.be.ok;
        }

        done();
      });
    });
  });
});
