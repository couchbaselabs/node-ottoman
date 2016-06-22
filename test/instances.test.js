'use strict';

var chai = require('chai');
var expect = chai.expect;
var H = require('./harness');
var ottoman = H.lib;

describe('Model Instances', function () {
  var modelId = H.uniqueId('model');
  var TestMdl = ottoman.model(modelId, {
    name: 'string'
  });
  var testInstance = new TestMdl({ name: 'Joe Blow' });

  before (function (done) {
    ottoman.ensureIndices(function (err) {
      if (err) { return done(err); }

      // Guarantee at least one saved.
      testInstance.save(function (err) {
        return done(err);
      })
    });
  });

  var modelId2 = H.uniqueId('model');
  var IdTestModel = ottoman.model(modelId2, {
    myId: { type: 'string', auto: 'uuid', readonly: true },
    name: 'string'
  }, {
      id: 'myId'
    });

  var testIdInstance = new IdTestModel({ name: 'Jane Smith' });

  it('should know its id', function (done) {
    var id = testInstance.id();
    expect(id).to.be.ok;
    done();
  });

  it('should respect user setting a different ID fields', function (done) {
    var id = testIdInstance.id();

    expect(id).to.be.ok;
    expect(id).to.equal(testIdInstance.myId);
    done();
  });

  if (ottoman.store instanceof ottoman.CbStoreAdapter) {
    it('should have a working find function', function (done) {
      TestMdl.find({ name: 'Joe Blow' }, {}, function (err, items) {
        if (err) { return done(err); }

        expect(items).to.be.an('Array');
        done();
      });
    });

    it('should have a working count function', function (done) {
      TestMdl.count({ name: 'Joe Blow' }, {}, function (err, count) {
        if (err) { return done(err); }

        expect(count).to.be.an('number');
        done();
      });
    });
  }

  it('should have a toJSON function', function (done) {
    var json = testInstance.toJSON();

    expect(json).to.be.ok;
    expect(json.name).to.equal('Joe Blow');

    // Should have an ID and a name field only.
    expect(Object.keys(json).length).to.equal(2);
    done();
  });

  it('should permit using ModelInstance.create', function (done) {
    TestMdl.create({ name: 'Jack Sparrow' }, function (err, modelInst) {
      expect(modelInst).to.be.ok;
      expect(modelInst.name).to.equal('Jack Sparrow');
      done();
    });
  });

  it('should support loadAll', function (done) {
    var ids = [];

    function createDummies(cb) {
      var created = 0;

      function makeDummy(cb) {
        if (created === 10) { return cb(null); }

        var mi = new TestMdl({ name: 'Test ' + created });

        mi.save(function (err) {
          if (err) { return cb(err); }

          created++;
          // console.log('Pushing ' + mi.id());
          ids.push(mi.id());

          return makeDummy(cb);
        });
      }

      makeDummy(cb);
    }

    createDummies(function (err) {
      if (err) { return done(err); }

      var toLoad = [];

      for(var i=0; i<10; i++) {
        var v = TestMdl.ref(ids[i]);
        toLoad = toLoad.concat([v]);
      }

      TestMdl.loadAll(toLoad, function (err) {
        if (err) { return done(err); }

        expect(toLoad.length).to.equal(10);

        for (var z = 0; z < 10; z++) {
          expect(toLoad[z]).to.be.an('object');
          expect(toLoad[z].name).to.be.ok;
        }

        done();
      });
    });
  });
});
