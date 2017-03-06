'use strict';

var chai = require('chai');
var expect = chai.expect;
var assert = require('chai').assert;
var H = require('./harnessMultipleOttoman');

describe('Namespace', function () {
  // Add long timeout in case of slow response on CI build servers.
  this.timeout(10000);

  it('should be able to make reference between namespaces, with passed models ',
  function(done) {
    var modelId1 = H.uniqueId('model');
    var modelId2 = H.uniqueId('model');
    var ottomanA = H.setupOttoman('A');
    var Model1 = ottomanA.model(modelId1, {
      'str': 'string'
    });

    var ottomanB = H.setupOttoman('B', ottomanA.models, ottomanA.types);
    var Model2 = ottomanB.model(modelId2, {
      'str': 'string',
      'model1': {
        'ref': Model1
      }
    });

    var m1 = new Model1({ str: 'test1' });
    m1.save(function (err) {
      expect(err).to.be.null;
      var m2 = new Model2({ str: 'test2', model1: m1 });
      m2.save(function (err) {
        expect(err).to.be.null;
        done();
      });
    });

  });

  it('should fail to make reference between namespaces, without passed models ',
  function(done) {
    var modelId1 = H.uniqueId('model');
    var modelId2 = H.uniqueId('model');
    var ottomanA = H.setupOttoman('A');
    var Model1 = ottomanA.model(modelId1, {
      'str': 'string'
    });

    var ottomanB = H.setupOttoman('B');
    var Model2 = ottomanB.model(modelId2, {
      'str': 'string',
      'model1': {
        'ref': Model1
      }
    });

    var m1 = new Model1({ str: 'test1' });
    m1.save(function (err) {
      expect(err).to.be.null;
      expect(function() {
        var m2 = new Model2({ str: 'test2', model1: m1 });
      }).to.throw(TypeError);
      done();
    });
  });


  /* this tests explicit if that there is no connection between
   * models in different ottomans
   * if all the models would refer to the same object it would be
   * possible to create a model with the same name in a different namespaces
   * with the same shared base ottoman
   */
  it('should be able use a base ottoman more then once',
  function(done) {
    var modelId1 = H.uniqueId('model');
    var modelId2 = H.uniqueId('model');
    var ottomanA = H.setupOttoman('A');
    var Model1 = ottomanA.model(modelId1, {
      'str': 'string'
    });

    var ottomanB = H.setupOttoman('B', ottomanA.models, ottomanA.types);
    var Model2 = ottomanB.model(modelId2, {
      'str': 'string',
      'model1': {
        'ref': Model1
      }
    });

    var ottomanC = H.setupOttoman('C', ottomanA.models, ottomanA.types);
    // explicit test to set same model name (modelId2)
    var Model3 = ottomanC.model(modelId2, {
      'str': 'string',
      'model1': {
        'ref': Model1
      }
    });

    var m1 = new Model1({ str: 'test1' });
    m1.save(function (err) {
      expect(err).to.be.null;
      var m2 = new Model2({ str: 'test2', model1: m1 });
      m2.save(function (err) {
        expect(err).to.be.null;
        var m3 = new Model3({ str: 'test3', model1: m1 });
        m3.save(function (err) {
          expect(err).to.be.null;
          done();
        });
      });
    });

  });


  it('should n1ql query only in namespace', function(done) {
    var userModelId = H.uniqueId('model');
    var postModelId = H.uniqueId('model');
    var ottomanA = H.setupOttoman('A');
    var ottomanB = H.setupOttoman('B', ottomanA.models, ottomanA.types);

    var UserMdlA = ottomanA.model(userModelId, {
      name: 'string'
    }, {
        queries: {
          topPosts: {
            type: 'n1ql',
            of: postModelId,
            by: 'creator',
            consistency: ottomanA.Consistency.GLOBAL
          }
        }
      });
    var PostMdlA = ottomanA.model(postModelId, {
      creator: { ref: userModelId },
      msg: 'string'
    });

    var UserMdlB = ottomanB.model(userModelId, {
      name: 'string'
    }, {
        queries: {
          topPosts: {
            type: 'n1ql',
            of: postModelId,
            by: 'creator',
            consistency: ottomanB.Consistency.GLOBAL
          }
        }
      });
    var PostMdlB = ottomanB.model(postModelId, {
      creator: { ref: userModelId },
      msg: 'string'
    });

    ottomanA.ensureIndices(function (err) {
      assert.isNull(err);
      ottomanB.ensureIndices(function (err) {
        assert.isNull(err);

        var uxA = new UserMdlA();
        uxA.name = 'Bob';
        var uyA = new UserMdlA();
        uyA.name = 'Joe';

        var px1A = new PostMdlA();
        px1A.creator = uxA;
        px1A.msg = 'Bob Post 1';
        var px2A = new PostMdlA();
        px2A.creator = uxA;
        px2A.msg = 'Bob Post 2';
        var py1A = new PostMdlA();
        py1A.creator = uyA;
        py1A.msg = 'Joe Post 1';

        var uxB = new UserMdlB();
        uxB.name = 'Bob';
        var uyB = new UserMdlB();
        uyB.name = 'Joe';

        var px1B = new PostMdlB();
        px1B.creator = uxB;
        px1B.msg = 'Bob Post 1';
        var px2B = new PostMdlB();
        px2B.creator = uxB;
        px2B.msg = 'Bob Post 2';
        var py1B = new PostMdlB();
        py1B.creator = uyB;
        py1B.msg = 'Joe Post 1';

        // Let index creation catch up.
        setTimeout(function () {
          H.saveAll([uxA, uyA, px1A, px2A, py1A, uxB, uyB, px1B, px2B, py1B],
          function (err) {
            assert.isNull(err);

            uxA.topPosts(function (err, res) {
              assert.isNull(err);
              assert.isArray(res);
              assert.propertyVal(res, 'length', 2);
              var objx1 = null, objx2 = null;
              if (res[0]._id === px1A._id) {
                objx1 = res[0];
                objx2 = res[1];
              } else if (res[0]._id === px2A._id) {
                objx2 = res[0];
                objx1 = res[1];
              } else {
                assert.fail();
              }

              assert.equal(objx1._id, px1A._id);
              assert.equal(objx1.msg, 'Bob Post 1');
              assert.equal(objx2._id, px2A._id);
              assert.equal(objx2.msg, 'Bob Post 2');
              UserMdlA.find({}, {}, function (err, res) {
                assert.isNull(err);
                assert.isArray(res);
                assert.equal(res.length, 2);
                assert.equal(res[0]._id, uxA._id);
                assert.equal(res[1]._id, uyA._id);
              });

              uxB.topPosts(function (err, res) {
                assert.isNull(err);
                assert.isArray(res);
                assert.propertyVal(res, 'length', 2);
                var objx1 = null, objx2 = null;
                if (res[0]._id === px1B._id) {
                  objx1 = res[0];
                  objx2 = res[1];
                } else if (res[0]._id === px2B._id) {
                  objx2 = res[0];
                  objx1 = res[1];
                } else {
                  assert.fail();
                }

                assert.equal(objx1._id, px1B._id);
                assert.equal(objx1.msg, 'Bob Post 1');
                assert.equal(objx2._id, px2B._id);
                assert.equal(objx2.msg, 'Bob Post 2');
                UserMdlB.find({}, {}, function (err, res) {
                  assert.isNull(err);
                  assert.isArray(res);
                  assert.equal(res.length, 2);
                  assert.equal(res[0]._id, uxB._id);
                  assert.equal(res[1]._id, uyB._id);
                });
                done();
              });
            });
          });
        }, 1000);
      });
    });
  });

});
