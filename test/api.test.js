'use strict';

var chai = require('chai');
var expect = chai.expect;
var H = require('./harness');
var ottoman = H.lib;
var CbStoreAdapter = require('../lib/cbstoreadapter');
var StoreAdapter = require('../lib/storeadapter');
var Schema = require('../lib/schema');

/**
 * Purpose of this test is just to verify that the public API remains stable.
 * This doesn't run functions, but checks that they exist.  This allows more
 * free refactoring, with the guarantee that no basic API contract has been
 * broken.
 *
 * Still need to be careful not to re-order function arguments or change
 * function semantics, but this is a basic and easy check to put in place
 * as a safety guard.
 */
describe('Public API', function () {
  var modelId = H.uniqueId('model');
  var TestMdl = ottoman.model(modelId, {
    name: 'string'
  });

  var mdlInstance = new TestMdl({ name: 'foo' });

  var adapterInst = new CbStoreAdapter({ 'bogusBucket': true }, {});

  var publicAPI = {
    CbStoreAdapter: {
      module: CbStoreAdapter,
      instance: adapterInst,
      staticFunctions: [],
      functions: ['count', 'createIndex', 'ensureIndices', 'find',
        'get', 'isNotFoundError', 'remove', 'searchIndex', 'store']
    },

    ottoman: {
      module: ottoman,
      instance: ottoman,
      staticFunctions: ['ensureIndices', 'fromCoo', 'getModel',
        'isModel', 'isTypeDef', 'model'],
      functions: []
    },

    ModelInstance: {
      module: TestMdl,
      instance: mdlInstance,
      functions: ['id', 'load',
        'loaded', 'remove', 'save', 'toJSON'],
      staticFunctions: ['applyData', 'count', 'create', 'find', 'fromData',
        'getById', 'loadAll', 'namePath', 'post', 'pre', 'ref', 'refByKey'],

      children: {
        schema: {
          module: Schema,

          staticFunctions: [
            'isCoreType', 'coreTypeByName'
          ],
          functions: [
            'namePath', 'indexName', 'refKey', 'addField', 'setIdField',
            'fieldVal', 'field', 'fieldType'
          ]
        }
      }
    }
  };

  describe('Global', function () {
    it('ottoman should expose Consistency', function (done) {
      expect(ottoman.Consistency).to.have.all.keys(['NONE', 'LOCAL', 'GLOBAL']);
      done();
    });

    it('StoreAdapter should expose SearchConsistency', function (done) {
      expect(StoreAdapter.SearchConsistency)
        .to.have.all.keys(['NONE', 'LOCAL', 'GLOBAL']);
      done();
    });
  });

  Object.keys(publicAPI).forEach(function (key) {
    describe(key + ' API', function () {
      var module = publicAPI[key].module;
      var instance = publicAPI[key].instance;
      var functions = publicAPI[key].functions;

      if (instance) {
        functions.forEach(function (f) {
          it('should expose ' + f, function (done) {
            expect(instance[f]).to.be.an('function');
            done();
          });
        });
      }

      publicAPI[key].staticFunctions.forEach(function (sf) {
        it('should expose static function ' + sf,
          function (done) {
            var func = (module[sf] || module.super_[sf]);
            expect(func).to.be.an('function');
            done();
          });
      });

      if (publicAPI[key].children) {
        var children = publicAPI[key].children;

        Object.keys(children).forEach(function (prop) {
          publicAPI[key].children[prop].staticFunctions
            .forEach(function (func) {
              var thisMod = publicAPI[key].children[prop].module;

              it(
                'should expose static child field ' + prop + '.' + func,
                function (done) {
                  expect(thisMod[func]).to.be.an('function');
                  done();
                });
            });

          publicAPI[key].children[prop].functions
            .forEach(function (func) {
              it('should expose child field ' + prop + '.' + func,
                function (done) {
                  expect(module[prop]).to.be.an('object');
                  expect(module[prop][func]).to.be.an('function');
                  done();
                });
            });
        });
      }
    });
  });

});
