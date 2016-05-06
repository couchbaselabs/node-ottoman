'use strict';

var assert = require('chai').assert;
var H = require('./harness');
var ottoman = H.lib;

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

  it('should fail with an invalid type specified in array', function() {
    var modelId = H.uniqueId('model');
    assert.throws(function() {
      ottoman.model(modelId, {
        'test': ['stringxxxx']
      });
    });
  });

  it('should fail when an array type has more than one member', function() {
    var modelId = H.uniqueId('model');
    assert.throws(function () {
      ottoman.model(modelId, {
        'someField': ['string', 'string']
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

  it('should understand all basic types in both schema formats,'
  + ' flat and object',
  function () {
    var modelId = H.uniqueId('model');
    
    var counter = 0;
    function mkName(str) {
      return modelId + '_' + str + '_' + (++counter); 
    }
    
    var types = ['string', 'number', 'integer', 'boolean'];
    
    types.forEach(function(type) {
      ottoman.model(mkName(type), {
        'someField': type
      });
      
      ottoman.model(mkName(type), {
        'someField': { type: type }
      });
      
      ottoman.model(mkName(type), {
        'someFieldArray': [type]  
      });
      
      ottoman.model(mkName(type), {
        'someFieldArray': [{ type: type }]
      });
    });

  });

  it('should serialize basic types properly', function () {
    var modelId = H.uniqueId('model');

    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });
    var x = new TestMdl();
    var xJson = x.toCoo();

    assert.typeOf(xJson._type, 'string');
    assert.equal(xJson._type, ottoman.nsPrefix() + modelId);
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
    var xJson = x.toCoo();

    assert.equal(xJson.name, 'Frank');
  });

  it('should round-trip COO properly', function() {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    var x = new TestMdl();
    x.name = 'Frank';
    var xCoo = ottoman.toCoo(x);
    var xObj = ottoman.fromCoo(xCoo);

    assert.instanceOf(xObj, TestMdl);
    assert.equal(x.name, xObj.name);
  });

  it('should fail to deserialize a type with incorrect explicit type',
  function() {
    var modelId = H.uniqueId('model');
    var fakeModelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    var x = new TestMdl();
    x.name = 'Frank';
    var xCoo = ottoman.toCoo(x);

    assert.throw(function() {
      ottoman.fromCoo(xCoo, fakeModelId);
    }, Error);
  });

  it('should deserialize a type with correct explicit type', function() {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    var x = new TestMdl();
    x.name = 'Frank';
    var xCoo = ottoman.toCoo(x);
    var xObj = ottoman.fromCoo(xCoo, modelId);

    assert.instanceOf(xObj, TestMdl);
    assert.equal(x.name, xObj.name);
  });

  it('should fail to deserialize a Mixed type without _type', function() {
    var data = {
      name: 'Frank'
    };
    assert.throw(function() {
      ottoman.fromCoo(data);
    }, Error);
  });

  it('should deserialize with an explicit type', function() {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    var data = {
      name: 'Frank'
    };
    var x = ottoman.fromCoo(data, modelId);
    assert.instanceOf(x, TestMdl);
    assert.equal(x.name, 'Frank');
  });

  it('should fail to deserialize an unregistered type', function() {
    var modelId = H.uniqueId('model');
    var data = {
      _type: modelId,
      name: 'Frank'
    };
    assert.throw(function() {
      ottoman.fromCoo(data);
    }, Error);
  });

  describe('Strings', function() {
    it('should serialize string types properly', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        str: 'string'
      });
      var x = new TestMdl();
      x.str = 'Bob';
      var xJson = x.toCoo();

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
      var xJson = x.toCoo();

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
      var xJson = x.toCoo();

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
      var xJson = x.toCoo();

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
      var xJson = x.toCoo();

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
      var xJson = x.toCoo();

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
      var xJson = x.toCoo();

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
      var xJson = x.toCoo();

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
      var xJson = x.toCoo();

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
      var xJson = x.toCoo();

      assert.instanceOf(xJson.when, Object);
      assert.equal(xJson.when._type, 'Date');
      assert.equal(xJson.when.v, x.when.toISOString());
    });
  });

  describe('Groups', function() {
    it('should serialize groups properly', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        who: {
          name: 'string'
        }
      });
      var x = new TestMdl();
      x.who.name = 'George';
      var xJson = x.toCoo();

      assert.instanceOf(xJson.who, Object);
      assert.equal(xJson.who.name, 'George');
    });
  });

  describe('Types', function() {
    it('should use types by name properly', function() {
      var typeId = H.uniqueId('type');
      var modelId = H.uniqueId('model');
      ottoman.type(typeId, {
        type: 'string'
      });
      var TestMdl = ottoman.model(modelId, {
        name: typeId
      });
      var x = new TestMdl();
      x.name = 'George';
      var xJson = x.toCoo();
      assert.typeOf(xJson.name, 'string');
    });

    it('should use types by reference properly', function() {
      var typeId = H.uniqueId('type');
      var modelId = H.uniqueId('model');
      var TestType = ottoman.type(typeId, 'string');
      var TestMdl = ottoman.model(modelId, {
        name: TestType
      });
      var x = new TestMdl();
      x.name = 'George';
      var xJson = x.toCoo();
      assert.typeOf(xJson.name, 'string');
    });
  });

  describe('Defaults', function() {
    it('should work with default string values', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        name: {type: 'string', default:'Frank'}
      });
      var x = new TestMdl();
      var xJson = x.toCoo();

      assert.typeOf(xJson.name, 'string');
      assert.equal(xJson.name, 'Frank');
    });

    it('should work with default number values', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        num: {type: 'number', default:14.4}
      });
      var x = new TestMdl();
      var xJson = x.toCoo();

      assert.typeOf(xJson.num, 'number');
      assert.equal(xJson.num, 14.4);
    });

    it('should work with default date values', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        when: {type: 'Date', default:new Date()}
      });
      var x = new TestMdl();
      var xJson = x.toCoo();

      assert.typeOf(xJson.when, 'string');
      assert.equal(xJson.when, x.when.toISOString());
    });

    it('should work with default value functions', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        num: {type: 'number', default:function(){return 19.3;}}
      });
      var x = new TestMdl();
      var xJson = x.toCoo();

      assert.typeOf(xJson.num, 'number');
      assert.equal(xJson.num, 19.3);
    });

    it('should work with default falsy value', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        num: {type: 'number', default: 0},
        bool: {type: 'boolean', default: false}
      });
      var x = new TestMdl();
      var xJson = x.toCoo();

      assert.typeOf(xJson.num, 'number');
      assert.equal(xJson.num, 0);
      assert.typeOf(xJson.bool, 'boolean');
      assert.equal(xJson.bool, false);
    });
  });

  describe('Ids', function() {
    it('should fail if the model defines an id property', function() {
      assert.throws(function() {
        var modelId = H.uniqueId('model');
        ottoman.model(modelId, {
          id: 'string'
        });
      }, Error);
    });

    it('should accept custom id properties', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        customId: {type:'string', auto:'uuid', readonly:true}
      }, {
        id: 'customId'
      });
      var x = new TestMdl();
      var xJson = x.toCoo();

      assert.notProperty(xJson, '_id');
      assert.equal(xJson.customId, x.customId);
    });

    it('should accept custom id properties inside groups', function() {
      var modelId = H.uniqueId('model');
      var TestMdl = ottoman.model(modelId, {
        test: {
          customId: {type:'string', auto:'uuid', readonly:true}
        }
      }, {
        id: 'test.customId'
      });
      var x = new TestMdl();
      var xJson = x.toCoo();

      assert.notProperty(xJson, '_id');
      assert.equal(xJson.test.customId, x.test.customId);
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

  it('should successfully save and load an object', function(done) {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    var x = new TestMdl();
    x.name = 'George';

    x.save(function(err) {
      assert.isNull(err);

      var y = TestMdl.ref(x._id);
      y.load(function(err) {
        assert.isNull(err);

        assert.instanceOf(y, TestMdl);
        assert.equal(x._id, y._id);
        assert.equal(x.name, y.name);
        done();
      });
    });
  });

  it('should correctly advertise .loaded()', function(done) {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    var x = new TestMdl();
    x.name = 'George';

    assert.isTrue(x.loaded());

    x.save(function(err) {
      assert.isNull(err);
      assert.isTrue(x.loaded());

      var y = TestMdl.ref(x._id);
      assert.isFalse(y.loaded());
      y.load(function(err) {
        assert.isNull(err);
        assert.isTrue(y.loaded());

        done();
      });
    });
  });

  it('should successfully load object with getById', function(done) {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    var x = new TestMdl();
    x.name = 'George';

    x.save(function(err) {
      assert.isNull(err);

      TestMdl.getById(x._id, function(err, y) {
        assert.isNull(err);

        assert.instanceOf(y, TestMdl);
        assert.equal(x._id, y._id);
        assert.equal(x.name, y.name);
        done();
      });
    });
  });

  it('should successfully remove objects', function(done) {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    var x = new TestMdl();
    x.name = 'George';

    x.save(function(err) {
      assert.isNull(err);

      TestMdl.getById(x._id, function(err) {
        assert.isNull(err);

        x.remove(function(err) {
          assert.isNull(err);

          TestMdl.getById(x._id, function(err) {
            assert.isNotNull(err);

            done();
          });
        });
      });
    });
  });

  it('should successfully remove objects with refdoc indices', function(done) {
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

    var x = new TestMdl();
    x.name = 'George';

    x.save(function(err) {
      assert.isNull(err);

      TestMdl.findByName(x.name, function(err) {
        assert.isNull(err);

        x.remove(function(err) {
          assert.isNull(err);

          TestMdl.findByName(x.name, function(err, z) {
            assert.isNull(err);
            assert.lengthOf(z, 0);

            done();
          });
        });
      });
    });
  });

  it('should fail to load an invalid id', function(done) {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    var y = TestMdl.ref('INVALID ID');
    y.load(function(err) {
      assert.isNotNull(err);
      done();
    });
  });

  it('should fail getById with invalid id', function(done) {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    TestMdl.getById('INVALID ID', function(err) {
      assert.isNotNull(err);
      done();
    });
  });

  it('should allow constructor options', function() {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    var x = new TestMdl({name:'Joseph'});
    assert.equal(x.name, 'Joseph');
  });

  it('should validate a model', function() {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: {
        type:'string', 
        validator:function(value){
          if(typeof(value) !== 'string' ){
            throw new Error('bad data');
          }
        }
      }
    });

    var x = new TestMdl({name:'Joseph'});
    ottoman.validate(x, function(err){
      assert.isNull(err);
    });
  });

  it('should fail to validate bad data', function() {
    var modelId = H.uniqueId('model');
    var TestMdl = ottoman.model(modelId, {
      name: {
        type:'string', 
        validator:function(value){
          if(typeof value !== 'string' ){
            throw new Error('bad data');
          }
        }
      }
    });

    var x = new TestMdl({name:'Joseph'});
    x.name = 1;
    ottoman.validate(x, function(err){
      assert.isNotNull(err);
    });
  });




});
