'use strict';

var chai = require('chai');
var expect = chai.expect;
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

});
