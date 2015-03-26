var assert = require('chai').assert;
var H = require('./harness');
var ottoman = require('../lib/ottoman');

describe('Models', function() {

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

  it('should understand all basic types', function() {
    var modelId = H.uniqueId('model');
    ottoman.model(modelId, {
      'str': 'string',
      'num': 'number',
      'int': 'integer',
      'bool': 'boolean'
    });
  });

  it('should serialize basic types properly', function () {
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

    assert.typeOf(xJson._type, 'string');
    assert.equal(xJson._type, modelId);
    assert.typeOf(xJson._id, 'string');
    assert.equal(xJson._id, x._id);
    assert.isUndefined(xJson.name);
  });

  it('should serialize string types properly', function () {
    var modelId = H.uniqueId('model');

    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });
    var x = new TestMdl();
    x.name = 'Frank';
    var xJson = x.toJSON();

    assert.equal(xJson.name, 'Frank');
  });

  describe('Strings', function() {
    it('should serialize string types properly', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        str: 'string'
      });
      var x = new TestMdl();
      x.str = 'Bob';
      var xJson = x.toJSON();

      assert.typeOf(xJson.str, 'string');
      assert.equal(xJson.str, 'Bob');
    });

    it('should serialize mixed string types properly', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        str: 'Mixed'
      });
      var x = new TestMdl();
      x.str = 'Bob';
      var xJson = x.toJSON();

      assert.typeOf(xJson.str, 'string');
      assert.equal(xJson.str, 'Bob');
    });
  });

  describe('Numbers', function() {
    it('should serialize numbers types properly', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        num: 'integer'
      });
      var x = new TestMdl();
      x.num = 44.4;
      var xJson = x.toJSON();

      assert.typeOf(xJson.num, 'number');
      assert.equal(xJson.num, 44.4);
    });

    it('should serialize mixed numbers types properly', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        num: 'Mixed'
      });
      var x = new TestMdl();
      x.num = 44.4;
      var xJson = x.toJSON();

      assert.typeOf(xJson.num, 'number');
      assert.equal(xJson.num, 44.4);
    });
  });

  describe('Integers', function() {
    it('should serialize integer types properly', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        int: 'integer'
      });
      var x = new TestMdl();
      x.int = 44;
      var xJson = x.toJSON();

      assert.typeOf(xJson.int, 'number');
      assert.equal(xJson.int, 44);
    });

    it('should serialize mixed integer types properly', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        int: 'Mixed'
      });
      var x = new TestMdl();
      x.int = 44;
      var xJson = x.toJSON();

      assert.typeOf(xJson.int, 'number');
      assert.equal(xJson.int, 44);
    });
  });

  describe('Booleans', function() {
    it('should serialize boolean types properly', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        bool: 'integer'
      });
      var x = new TestMdl();
      x.bool = true;
      var xJson = x.toJSON();

      assert.typeOf(xJson.bool, 'boolean');
      assert.equal(xJson.bool, true);
    });

    it('should serialize mixed boolean types properly', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        bool: 'Mixed'
      });
      var x = new TestMdl();
      x.bool = true;
      var xJson = x.toJSON();

      assert.typeOf(xJson.bool, 'boolean');
      assert.equal(xJson.bool, true);
    });
  });

  describe('Dates', function() {
    it('should serialize date types properly', function () {
      var modelId = H.uniqueId('model');

      var TestMdl = ottoman.model(modelId, {
        when: 'Date'
      });
      var x = new TestMdl();
      x.when = new Date();
      var xJson = x.toJSON();

      assert.typeOf(xJson.when, 'string');
      assert.equal(xJson.when, x.when.toISOString());
    });

    it('should serialize mixed date types properly', function () {
      var modelId = H.uniqueId('model');

      var TestMdl = ottoman.model(modelId, {
        when: 'Mixed'
      });
      var x = new TestMdl();
      x.when = new Date();
      var xJson = x.toJSON();

      assert.instanceOf(xJson.when, Object);
      assert.equal(xJson.when._type, 'Date');
      assert.equal(xJson.when.v, x.when.toISOString());
    });
  });

  it('should have a working custom inspector', function() {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string',
      test: {
        jayd: 'string'
      }
    });
    var x = new TestMdl();
    x.inspect();

    var y = TestMdl.ref('11');
    y.inspect();
  });

});
