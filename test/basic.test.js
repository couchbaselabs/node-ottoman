var assert = require('assert');
var H = require('./harness');
var ottoman = require('../lib/ottoman');

it('should fail to register two models with the same name', function() {
  var modelId = H.uniqueId('model');

  ottoman.model(modelId, {});
  assert.throws(function() {
    ottoman.model(modelId, {});
  });
});

it('should fail with an invalid type specified', function() {
  var modelId = H.uniqueId('model');
  assert.throws(function() {
    ottoman.model(modelId, {
      'test': 'stringxxxx'
    });
  });
});

it('should understand a all basic types', function() {
  var modelId = H.uniqueId('model');
  ottoman.model(modelId, {
    'str': 'string',
    'num': 'number',
    'int': 'integer',
    'bool': 'boolean'
  });
});

it('should something', function () {
  var modelId = H.uniqueId('model');

  var TestMdl = ottoman.model(modelId, {
    name: 'string'
  });
  var x = new TestMdl();
  var xJson = x.toJSON();
  var expectJson = {
    _type: modelId,
    _id: xJson._id
  };

  assert(typeof xJson._id === 'string');
  assert.deepEqual(xJson, expectJson);
});
