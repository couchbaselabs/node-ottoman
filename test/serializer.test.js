'use strict';

var chai = require('chai');
var expect = chai.expect;
var ottoman = require('./../lib/ottoman');
var JsSerializer = require('./../lib/codec/jsserializer');
var CooSerializer = require('./../lib/codec/cooserializer');
var RefJsSerializer = require('./../lib/codec/refjsserializer');
var ModelInstance = require('./../lib/model/modelinstance');

describe('Serializers', function() {
  var o = new ottoman.Ottoman();

  var OtherMdl = o.model('OtherMdl', {
    test: 'string'
  });
  var OtherSch = o.schema('OtherSch', {
    test: 'string'
  });

  var ModelRefMdl = o.model('ModelRefMdl', {
    value: OtherMdl
  });
  var SchemaMdl = o.model('SchemaMdl', {
    value: OtherSch
  });
  var BooleanMdl = o.model('BooleanMdl', {
    value: 'boolean'
  });
  var StringMdl = o.model('StringMdl', {
    value: 'string'
  });
  var NumberMdl = o.model('NumberMdl', {
    value: 'number'
  });
  var DateMdl = o.model('DateMdl', {
    value: 'Date'
  });
  var ModelRefListMdl = o.model('ModelRefListMdl', {
    value: [OtherMdl]
  });
  var SchemaListMdl = o.model('SchemaListMdl', {
    value: [OtherSch]
  });
  var BooleanListMdl = o.model('BooleanListMdl', {
    value: ['boolean']
  });
  var StringListMdl = o.model('StringListMdl', {
    value: ['string']
  });
  var NumberListMdl = o.model('NumberListMdl', {
    value: ['number']
  });
  var DateListMdl = o.model('DateListMdl', {
    value: ['Date']
  });
  var MixedMdl = o.model('MixedMdl', {
    value: 'Mixed'
  });
  var MixedListMdl = o.model('MixedListMdl', {
    value: ['Mixed']
  });

  var testOtherSch = new OtherSch({
    test: 'hi'
  });
  var testOtherMdl = new OtherMdl({
    test: 'hi'
  });

  var testModelRefObj = new ModelRefMdl({
    value: testOtherMdl
  });
  var testSchemaObj = new SchemaMdl({
    value: testOtherSch
  });
  var testBooleanObj = new BooleanMdl({
    value: true
  });
  var testStringObj = new StringMdl({
    value: 'hello world'
  });
  var testNumberObj = new NumberMdl({
    value: 1337
  });
  var testDateObj = new DateMdl({
    value: new Date()
  });

  var testModelRefListObj = new ModelRefListMdl({
    value: [testOtherMdl]
  });
  var testSchemaListObj = new SchemaListMdl({
    value: [testOtherSch]
  });
  var testBooleanListObj = new BooleanListMdl({
    value: [true, false]
  });
  var testStringListObj = new StringListMdl({
    value: ['foo', 'bar']
  });
  var testNumberListObj = new NumberListMdl({
    value: [2, 4]
  });
  var testDateListObj = new DateListMdl({
    value: [new Date(), new Date()]
  });

  var testMixedModelRefObj = new MixedMdl({
    value: testOtherMdl
  });
  var testMixedSchemaObj = new MixedMdl({
    value: testOtherSch
  });
  var testMixedBooleanObj = new MixedMdl({
    value: true
  });
  var testMixedStringObj = new MixedMdl({
    value: 'hello world'
  });
  var testMixedNumberObj = new MixedMdl({
    value: 1337
  });
  var testMixedDateObj = new MixedMdl({
    value: new Date()
  });
  var testMixedMapObj = new MixedMdl({
    value: {x:'test'}
  });
  var testMixedListObj = new MixedMdl({
    value: ['foo', 'bar']
  });
  // TODO: Maybe add more tests with lists and MixedMdl

  var testMixedModelRefListObj = new MixedListMdl({
    value: [testOtherMdl]
  });
  var testMixedSchemaListObj = new MixedListMdl({
    value: [testOtherSch]
  });
  var testMixedBooleanListObj = new MixedListMdl({
    value: [true, false]
  });
  var testMixedStringListObj = new MixedListMdl({
    value: ['foo', 'bar']
  });
  var testMixedNumberListObj = new MixedListMdl({
    value: [2, 4]
  });
  var testMixedDateListObj = new MixedListMdl({
    value: [new Date(), new Date()]
  });
  var testMixedMapListObj = new MixedListMdl({
    value: [{x: 'foo'}, {y: 'bar'}]
  });

  function checkSerValue(ser, mdlInst, value) {
    var serData = ser.serialize(mdlInst);
    expect(serData.value).to.deep.equal(value);
  }

  function testSerGeneric(ser) {
    it('should serialize booleans correctly', function() {
      checkSerValue(ser, testBooleanObj, true);
    });

    it('should serialize strings correctly', function () {
      checkSerValue(ser, testStringObj, 'hello world');
    });

    it('should serialize numbers correctly', function () {
      checkSerValue(ser, testNumberObj, 1337);
    });

    it('should serialize dates correctly', function() {
      checkSerValue(ser, testDateObj, testDateObj.value.toJSON());
    });
  }

  function testSerListGeneric(ser) {
    it('should serialize boolean lists correctly', function() {
      checkSerValue(ser, testBooleanListObj, [true, false]);
    });

    it('should serialize string lists correctly', function() {
      checkSerValue(ser, testStringListObj, ['foo', 'bar']);
    });

    it('should serialize number lists correctly', function() {
      checkSerValue(ser, testNumberListObj, [2, 4]);
    });

    it('should serialize date lists correctly', function() {
      checkSerValue(ser, testDateListObj, [
        testDateListObj.value[0].toJSON(),
        testDateListObj.value[1].toJSON()
      ]);
    });
  }

  function testSerMixedGeneric(ser) {
    it('should serialize mixed booleans correctly', function() {
      checkSerValue(ser, testMixedBooleanObj, true);
    });

    it('should serialize mixed strings correctly', function() {
      checkSerValue(ser, testMixedStringObj, 'hello world');
    });

    it('should serialize mixed numbers correctly', function() {
      checkSerValue(ser, testMixedNumberObj, 1337);
    });

    it('should serialize mixed maps correctly', function() {
      checkSerValue(ser, testMixedMapObj, {x: 'test'});
    })

    it('should serialize mixed lists correctly', function() {
      checkSerValue(ser, testMixedListObj, ['foo', 'bar']);
    })
  }

  function testSerMixedListGeneric(ser) {
    it('should serialize mixed boolean lists correctly', function() {
      checkSerValue(ser, testMixedBooleanListObj, [true, false]);
    });

    it('should serialize mixed string lists correctly', function() {
      checkSerValue(ser, testMixedStringListObj, ['foo', 'bar']);
    });

    it('should serialize mixed number lists correctly', function() {
      checkSerValue(ser, testMixedNumberListObj, [2, 4]);
    });

    it('should serialize mixed map lists correctly', function() {
      checkSerValue(ser, testMixedMapListObj, [{x:'foo'}, {y:'bar'}]);
    })
  }

  function serRtValue(ser, mdlInst) {
    var model = mdlInst.constructor;
    var serData = ser.serialize(mdlInst);
    var decData = ser.decode(model.schema, serData);
    return new model(decData);
  }

  function checkSerRt(ser, mdlInst) {
    var decMdlInst = serRtValue(ser, mdlInst);
    expect(decMdlInst).to.deep.equal(mdlInst);
  }

  function checkSerRtFail(ser, mdlInst) {
    expect(function() {
      serRtValue(ser, mdlInst);
    }).to.throw(Error);
  }

  function checkSerRtModelRef(ser) {
    var decMdlInst = serRtValue(ser, testModelRefObj);
    expect(decMdlInst.value).to.be.instanceof(OtherMdl);
    expect(decMdlInst.value.id()).to.be.equal(testOtherMdl._id);
    expect(decMdlInst.value.loaded()).to.be.false;
  }

  function checkSerRtModelRefList(ser) {
    var decMdlInst = serRtValue(ser, testModelRefListObj);
    expect(decMdlInst.value[0]).to.be.instanceof(OtherMdl);
    expect(decMdlInst.value[0].id()).to.be.equal(testOtherMdl._id);
    expect(decMdlInst.value[0].loaded()).to.be.false;
  }

  function testRtGeneric(ser) {
    it('should round-trip schemas correctly', function() {
      checkSerRt(ser, testSchemaObj);
    });

    it('should round-trip booleans correctly', function() {
      checkSerRt(ser, testBooleanObj);
    });

    it('should round-trip strings correctly', function() {
      checkSerRt(ser, testStringObj);
    });

    it('should round-trip numbers correctly', function() {
      checkSerRt(ser, testNumberObj);
    });

    it('should round-trip dates correctly', function() {
      checkSerRt(ser, testDateObj);
    });
  }

  function testRtListGeneric(ser) {
    it('should round-trip schema lists correctly', function() {
      checkSerRt(ser, testSchemaListObj);
    });

    it('should round-trip boolean lists correctly', function() {
      checkSerRt(ser, testBooleanListObj);
    });

    it('should round-trip string lists correctly', function() {
      checkSerRt(ser, testStringListObj);
    });

    it('should round-trip number lists correctly', function() {
      checkSerRt(ser, testNumberListObj);
    });

    it('should round-trip date lists correctly', function() {
      checkSerRt(ser, testDateListObj);
    });
  }

  function testRtMixedGeneric(ser) {
    it('should round-trip mixed booleans correctly', function() {
      checkSerRt(ser, testMixedBooleanObj);
    });

    it('should round-trip mixed strings correctly', function() {
      checkSerRt(ser, testMixedStringObj);
    });

    it('should round-trip mixed numbers correctly', function() {
      checkSerRt(ser, testMixedNumberObj);
    });

    it('should round-trip mixed dates correctly', function() {
      checkSerRt(ser, testMixedDateObj);
    });

    it('should round-trip mixed maps correctly', function() {
      checkSerRt(ser, testMixedMapObj)
    });

    it('should round-trip mixed lists correctly', function() {
      checkSerRt(ser, testMixedListObj)
    });
  }

  function testRtMixedListGeneric(ser) {
    it('should round-trip mixed boolean lists correctly', function() {
      checkSerRt(ser, testMixedBooleanListObj);
    });

    it('should round-trip mixed string lists correctly', function() {
      checkSerRt(ser, testMixedStringListObj);
    });

    it('should round-trip mixed number lists correctly', function() {
      checkSerRt(ser, testMixedNumberListObj);
    });

    it('should round-trip mixed date lists correctly', function() {
      checkSerRt(ser, testMixedDateListObj);
    });

    it('should round-trip mixed map lists correctly', function() {
      checkSerRt(ser, testMixedMapListObj);
    });
  }

  function testJsSer(ser, usesRefs) {
    it('should serialize model refs correctly', function() {
      if (!usesRefs) {
        checkSerValue(ser, testModelRefObj, {
          test: 'hi',
          _id: testOtherMdl._id
        });
      } else {
        checkSerValue(ser, testModelRefObj, {
          '$ref': 'OtherMdl',
          '$id': testOtherMdl._id
        });
      }
    });

    it('should serialize schemas correctly', function() {
      checkSerValue(ser, testSchemaObj, {
        test: 'hi'
      });
    });

    testSerGeneric(ser);

    it('should serialize model ref lists correctly', function() {
      if (!usesRefs) {
        checkSerValue(ser, testModelRefListObj, [{
          test: 'hi',
          _id: testOtherMdl._id
        }]);
      } else {
        checkSerValue(ser, testModelRefListObj, [{
          '$ref': 'OtherMdl',
          '$id': testOtherMdl._id
        }]);
      }
    });

    it('should serialize schema lists correctly', function() {
      checkSerValue(ser, testSchemaListObj, [{
        test: 'hi'
      }]);
    });

    testSerListGeneric(ser);

    it('should serialize mixed model refs correctly', function() {
      if (!usesRefs) {
        checkSerValue(ser, testMixedModelRefObj, {
          test: 'hi',
          _id: testOtherMdl._id
        });
      } else {
        checkSerValue(ser, testMixedModelRefObj, {
          '$id': testOtherMdl._id,
          '$ref': 'OtherMdl'
        });
      }
    });

    it('should serialize mixed schemas correctly', function() {
      checkSerValue(ser, testMixedSchemaObj, {
        'test': 'hi'
      });
    });

    testSerMixedGeneric(ser);

    it('should serialize mixed dates correctly', function() {
      checkSerValue(ser, testMixedDateObj, testMixedDateObj.value.toJSON());
    });

    it('should serialize mixed model ref lists correctly', function() {
      if (!usesRefs) {
        checkSerValue(ser, testMixedModelRefListObj, [{
          test: 'hi',
          _id: testOtherMdl._id
        }]);
      } else {
        checkSerValue(ser, testMixedModelRefListObj, [{
          '$id': testOtherMdl._id,
          '$ref': 'OtherMdl'
        }]);
      }
    });

    it('should serialize mixed schema lists correctly', function() {
      checkSerValue(ser, testMixedSchemaListObj, [{
        'test': 'hi'
      }]);
    });

    testSerMixedListGeneric(ser);

    it('should serialize mixed date lists correctly', function() {
      checkSerValue(ser, testMixedDateListObj, [
        testMixedDateListObj.value[0].toJSON(),
        testMixedDateListObj.value[1].toJSON()
      ]);
    });

    if (!usesRefs) {
      it('should round-trip models correctly', function () {
        checkSerRt(ser, testModelRefObj);
      });
    } else {
      it('should round-trip model references correctly', function() {
        checkSerRtModelRef(ser);
      });
    }

    testRtGeneric(ser);

    testRtListGeneric(ser);

    it('should fail to round-trip mixed types', function() {
      checkSerRtFail(ser, testMixedNumberObj);
    });

    it('should fail to round-trip mixed list types', function() {
      checkSerRtFail(ser, testMixedNumberListObj);
    });
  }

  describe('JS Serializer', function() {
    var ser = new JsSerializer(o);
    testJsSer(ser, false);
  });

  describe('Ref JS Serializer', function () {
    var ser = new RefJsSerializer(o);
    testJsSer(ser, true);
  });

  function testCooSer(ser, explicitTypes, typeName) {
    function _wrapType(obj, type, shouldWrap) {
      if (shouldWrap) {
        obj[typeName] = type;
      }
      return obj;
    }

    it('should serialize model refs correctly', function() {
      checkSerValue(ser, testModelRefObj, _wrapType({
        '$ref': testOtherMdl._id
      }, 'OtherMdl', explicitTypes));
    });

    it('should serialize schemas correctly', function() {
      checkSerValue(ser, testSchemaObj, _wrapType({
        test: 'hi'
      }, 'OtherSch', explicitTypes));
    });

    testSerGeneric(ser);

    it('should serialize model refs correctly', function() {
      checkSerValue(ser, testModelRefListObj, [_wrapType({
        '$ref': testOtherMdl._id
      }, 'OtherMdl', explicitTypes)]);
    });

    it('should serialize schemas correctly', function() {
      checkSerValue(ser, testSchemaListObj, [_wrapType({
        test: 'hi'
      }, 'OtherSch', explicitTypes)]);
    });

    testSerListGeneric(ser);

    it('should serialize mixed model refs correctly', function() {
      checkSerValue(ser, testMixedModelRefObj, _wrapType({
        '$ref': testOtherMdl._id
      }, 'OtherMdl', true));
    });

    it('should serialize mixed schemas correctly', function() {
      checkSerValue(ser, testMixedSchemaObj, _wrapType({
        'test': 'hi',
      },'OtherSch', true));
    });

    testSerMixedGeneric(ser);

    it('should serialize mixed dates correctly', function() {
      checkSerValue(ser, testMixedDateObj, _wrapType({
        v: testMixedDateObj.value.toJSON()
      }, 'Date', true));
    });

    it('should serialize mixed model ref lists correctly', function() {
      checkSerValue(ser, testMixedModelRefListObj, [_wrapType({
        '$ref': testOtherMdl._id
      }, 'OtherMdl', true)]);
    });

    it('should serialize mixed schema lists correctly', function() {
      checkSerValue(ser, testMixedSchemaListObj, [_wrapType({
        'test': 'hi',
      },'OtherSch', true)]);
    });

    testSerMixedListGeneric(ser);

    it('should serialize mixed date lists correctly', function() {
      checkSerValue(ser, testMixedDateListObj, [
        _wrapType({
          v: testMixedDateListObj.value[0].toJSON()
        }, 'Date', true),
        _wrapType({
          v: testMixedDateListObj.value[1].toJSON()
        }, 'Date', true)]);
    });

    it('should round-trip model references correctly', function() {
      checkSerRtModelRef(ser);
    });

    testRtGeneric(ser);

    it('should round-trip mixed schemas correctly', function() {
      checkSerRt(ser, testMixedSchemaObj);
    });

    testRtMixedGeneric(ser);

    it('should round-trip mixed schema lists correctly', function() {
      checkSerRt(ser, testMixedSchemaListObj);
    });

    testRtMixedListGeneric(ser);
  }

  describe('Coo Serializer', function() {
    var ser = new CooSerializer(o);
    testCooSer(ser, false, '_type');
  });

  describe('Coo Serializer w/ Explicit Types', function() {
    var ser = new CooSerializer(o, {
      explicitTypes: true
    });
    testCooSer(ser, true, '_type');
  });

  describe('Coo Serializer w/ Custom Type Field', function() {
    var ser = new CooSerializer(o, {
      typeField: '_class'
    });
    testCooSer(ser, false, '_class');
  });

  describe('Coo Serializer w/ Explicit Types, Custom Type Field', function() {
    var ser = new CooSerializer(o, {
      explicitTypes: true,
      typeField: '_class'
    });
    testCooSer(ser, true, '_class');
  });
});
