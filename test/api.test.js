const chai = require('chai');

const expect = chai.expect;
const H = require('./harness');

const ottoman = H.lib;
const ModelInstance = require('../lib/modelinstance');
const CbStoreAdapter = require('../lib/cbstoreadapter');
const StoreAdapter = require('../lib/storeadapter');
const Schema = require('../lib/schema');

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
describe('Public API', function() {
  const modelId = H.uniqueId('model');
  const TestMdl = ottoman.model(modelId, {
    name: 'string'
  });

  const mdlInstance = new TestMdl({ name: 'foo' });

  const adapterInst = new CbStoreAdapter({ bogusBucket: true }, {});

  const publicAPI = {
    CbStoreAdapter: {
      module: CbStoreAdapter,
      instance: adapterInst,
      staticFunctions: [],
      functions: [
        'count',
        'createIndex',
        'ensureIndices',
        'find',
        'get',
        'isNotFoundError',
        'remove',
        'searchIndex',
        'store'
      ]
    },

    ottoman: {
      module: ottoman,
      instance: ottoman,
      staticFunctions: [
        'ensureIndices',
        'fromCoo',
        'getModel',
        'isModel',
        'isTypeDef',
        'model'
      ],
      functions: []
    },

    ModelInstance: {
      module: TestMdl,
      instance: mdlInstance,
      functions: ['id', 'load', 'loaded', 'remove', 'save', 'toJSON'],
      staticFunctions: [
        'applyData',
        'count',
        'create',
        'find',
        'fromData',
        'getById',
        'loadAll',
        'namePath',
        'post',
        'pre',
        'ref',
        'refByKey'
      ],

      children: {
        schema: {
          module: Schema,

          staticFunctions: ['isCoreType', 'coreTypeByName'],
          functions: [
            'namePath',
            'indexName',
            'refKey',
            'addField',
            'setIdField',
            'fieldVal',
            'field',
            'fieldType'
          ]
        }
      }
    }
  };

  describe('Global', function() {
    it('ottoman should expose Consistency', function(done) {
      expect(ottoman.Consistency).to.have.all.keys(['NONE', 'LOCAL', 'GLOBAL']);
      done();
    });

    it('StoreAdapter should expose SearchConsistency', function(done) {
      expect(StoreAdapter.SearchConsistency).to.have.all.keys([
        'NONE',
        'LOCAL',
        'GLOBAL'
      ]);
      done();
    });
  });

  Object.keys(publicAPI).forEach(function(key) {
    describe(`${key} API`, function() {
      const module = publicAPI[key].module;
      const instance = publicAPI[key].instance;
      const functions = publicAPI[key].functions;

      if (instance) {
        functions.forEach(function(f) {
          it(`should expose ${f}`, function(done) {
            expect(instance[f]).to.be.an('function');
            done();
          });
        });
      }

      publicAPI[key].staticFunctions.forEach(function(sf) {
        it(`should expose static function ${sf}`, function(done) {
          const func = module[sf] || module.super_[sf];
          expect(func).to.be.an('function');
          done();
        });
      });

      if (publicAPI[key].children) {
        const children = publicAPI[key].children;

        Object.keys(children).forEach(function(childProp) {
          publicAPI[key].children[childProp].staticFunctions.forEach(function(
            childFunc
          ) {
            const thisMod = publicAPI[key].children[childProp].module;

            it(`should expose static child field ${childProp}.${childFunc}`, function(done) {
              expect(thisMod[childFunc]).to.be.an('function');
              done();
            });
          });

          publicAPI[key].children[childProp].functions.forEach(function(
            childFunc
          ) {
            it(`should expose child field ${childProp}.${childFunc}`, function(done) {
              expect(module[childProp]).to.be.an('object');
              expect(module[childProp][childFunc]).to.be.an('function');
              done();
            });
          });
        });
      }
    });
  });
});
