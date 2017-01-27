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
  var OtherSch = o.schema('OtherScr', {
    test: 'string'
  });

  var ModelRefMdl = o.model('ModelRefMdl', {
    value: OtherMdl
  });
  var SchemaMdl = o.model('SchemaMdl', {
    value: OtherSch
  });
  var StringMdl = o.model('StringMdl', {
    value: 'string'
  });
  var NumberMdl = o.model('NumberMdl', {
    value: 'number'
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
  var testStringObj = new StringMdl({
    value: 'hello world'
  });
  var testNumberObj = new NumberMdl({
    value: 1337
  });

  describe('JS Serializer', function() {
    var ser = new JsSerializer(o);

    it('should serialize models correctly', function() {
      var serData = ser.serialize(testModelRefObj);
      expect(serData).to.deep.equal({
        value: {
          test: 'hi',
          _id: testOtherMdl._id,
        },
        _id: testModelRefObj._id
      });
    });

    it('should serialize schemas correctly', function() {
      var serData = ser.serialize(testSchemaObj);
      expect(serData).to.deep.equal({
        value: {
          test: 'hi'
        },
        _id: testSchemaObj._id
      })
    });

    it('should serialize strings correctly', function() {
      var serData = ser.serialize(testStringObj);
      expect(serData).to.deep.equal({
        value: 'hello world',
        _id: testStringObj._id
      });
    });

    it('should serialize numbers correctly', function() {
      var serData = ser.serialize(testNumberObj);
      expect(serData).to.deep.equal({
        value: 1337,
        _id: testNumberObj._id
      });
    });
  });

  describe('Coo Serializer', function() {
    var ser = new CooSerializer(o);

    it('should serialize models correctly', function() {
      var serData = ser.serialize(testModelRefObj);
      expect(serData).to.deep.equal({
        value: {
          '_type': 'OtherMdl',
          '$ref': testOtherMdl._id
        },
        _id: testModelRefObj._id,
        _type: 'ModelRefMdl'
      });
    });

    it('should serialize schemas correctly', function() {
      var serData = ser.serialize(testSchemaObj);
      expect(serData).to.deep.equal({
        value: {
          test: 'hi'
        },
        _id: testSchemaObj._id,
        _type: 'SchemaMdl'
      })
    });

    it('should serialize strings correctly', function() {
      var serData = ser.serialize(testStringObj);
      expect(serData).to.deep.equal({
        value: 'hello world',
        _id: testStringObj._id,
        _type: 'StringMdl'
      });
    });

    it('should serialize numbers correctly', function() {
      var serData = ser.serialize(testNumberObj);
      expect(serData).to.deep.equal({
        value: 1337,
        _id: testNumberObj._id,
        _type: 'NumberMdl'
      });
    });
  });

  describe('Ref JS Serializer', function () {
    var ser = new RefJsSerializer(o);

    it('should serialize models correctly', function() {
      var serData = ser.serialize(testModelRefObj);
      expect(serData).to.deep.equal({
        value: {
          '$ref': 'OtherMdl',
          '$id': testOtherMdl._id
        },
        _id: testModelRefObj._id
      });
    });

    it('should serialize schemas correctly', function() {
      var serData = ser.serialize(testSchemaObj);
      expect(serData).to.deep.equal({
        value: {
          test: 'hi'
        },
        _id: testSchemaObj._id
      })
    });

    it('should serialize strings correctly', function() {
      var serData = ser.serialize(testStringObj);
      expect(serData).to.deep.equal({
        value: 'hello world',
        _id: testStringObj._id
      });
    });

    it('should serialize numbers correctly', function() {
      var serData = ser.serialize(testNumberObj);
      expect(serData).to.deep.equal({
        value: 1337,
        _id: testNumberObj._id
      });
    });
  });
});
