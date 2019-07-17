const assert = require('chai').assert;
const H = require('./harness');

const ottoman = H.lib;

describe('Models', function() {
  // Add long timeout in case of slow response on CI build servers.
  this.timeout(10000);

  it('should fail to register two models with the same name', function() {
    const modelId = H.uniqueId('model');

    ottoman.model(modelId, {});
    assert.throws(function() {
      ottoman.model(modelId, {});
    });
  });

  it('should fail with an invalid type specified', function() {
    const modelId = H.uniqueId('model');
    assert.throws(function() {
      ottoman.model(modelId, {
        test: 'stringxxxx'
      });
    });
  });

  it('should fail with an invalid type specified in array', function() {
    const modelId = H.uniqueId('model');
    assert.throws(function() {
      ottoman.model(modelId, {
        test: ['stringxxxx']
      });
    });
  });

  it('should fail when an array type has more than one member', function() {
    const modelId = H.uniqueId('model');
    assert.throws(function() {
      ottoman.model(modelId, {
        someField: ['string', 'string']
      });
    });
  });

  it('should understand all basic types', function() {
    const modelId = H.uniqueId('model');
    ottoman.model(modelId, {
      str: 'string',
      num: 'number',
      int: 'integer',
      bool: 'boolean'
    });
  });

  it(
    'should understand all basic types in both schema formats,' +
      ' flat and object',
    function() {
      const modelId = H.uniqueId('model');

      let counter = 0;
      function mkName(str) {
        return `${modelId}_${str}_${++counter}`;
      }

      const types = ['string', 'number', 'integer', 'boolean'];

      types.forEach(function(type) {
        ottoman.model(mkName(type), {
          someField: type
        });

        ottoman.model(mkName(type), {
          someField: { type }
        });

        ottoman.model(mkName(type), {
          someFieldArray: [type]
        });

        ottoman.model(mkName(type), {
          someFieldArray: [{ type }]
        });
      });
    }
  );

  describe('Coo format', function() {
    it('should serialize basic types properly', function() {
      const modelId = H.uniqueId('model');

      const TestMdl = ottoman.model(modelId, {
        name: 'string'
      });
      const x = new TestMdl();
      const xJson = x.toCoo();

      assert.typeOf(xJson._type, 'string');
      assert.equal(xJson._type, ottoman.nsPrefix() + modelId);
      assert.typeOf(xJson._id, 'string');
      assert.equal(xJson._id, x._id);
      assert.isUndefined(xJson.name);
    });

    it('should serialize string types properly', function() {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        name: 'string'
      });
      const x = new TestMdl();
      x.name = 'Frank';
      const xJson = x.toCoo();

      assert.equal(xJson.name, 'Frank');
    });

    it('should round-trip COO properly', function() {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        name: 'string'
      });

      const x = new TestMdl();
      x.name = 'Frank';
      const xCoo = ottoman.toCoo(x);
      const xObj = ottoman.fromCoo(xCoo);

      assert.instanceOf(xObj, TestMdl);
      assert.equal(x.name, xObj.name);
    });

    it('should fail to deserialize a type with incorrect explicit type', function() {
      const modelId = H.uniqueId('model');
      const fakeModelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        name: 'string'
      });

      const x = new TestMdl();
      x.name = 'Frank';
      const xCoo = ottoman.toCoo(x);

      assert.throw(function() {
        ottoman.fromCoo(xCoo, fakeModelId);
      }, Error);
    });

    it('should deserialize a type with correct explicit type', function() {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        name: 'string'
      });

      const x = new TestMdl();
      x.name = 'Frank';
      const xCoo = ottoman.toCoo(x);
      const xObj = ottoman.fromCoo(xCoo, modelId);

      assert.instanceOf(xObj, TestMdl);
      assert.equal(x.name, xObj.name);
    });

    it('should fail to deserialize a Mixed type without _type', function() {
      const data = {
        name: 'Frank'
      };
      assert.throw(function() {
        ottoman.fromCoo(data);
      }, Error);
    });

    it('should deserialize with an explicit type', function() {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        name: 'string'
      });

      const data = {
        name: 'Frank'
      };
      const x = ottoman.fromCoo(data, modelId);
      assert.instanceOf(x, TestMdl);
      assert.equal(x.name, 'Frank');
    });

    it('should fail to deserialize an unregistered type', function() {
      const modelId = H.uniqueId('model');
      const data = {
        _type: modelId,
        name: 'Frank'
      };
      assert.throw(function() {
        ottoman.fromCoo(data);
      }, Error);
    });

    describe('Strings', function() {
      it('should serialize string types properly', function() {
        const modelId = H.uniqueId('model');
        const TestMdl = ottoman.model(modelId, {
          str: 'string'
        });
        const x = new TestMdl();
        x.str = 'Bob';
        const xJson = x.toCoo();

        assert.typeOf(xJson.str, 'string');
        assert.equal(xJson.str, 'Bob');
      });

      it('should serialize mixed string types properly', function() {
        const modelId = H.uniqueId('model');
        const TestMdl = ottoman.model(modelId, {
          str: 'Mixed'
        });
        const x = new TestMdl();
        x.str = 'Bob';
        const xJson = x.toCoo();

        assert.typeOf(xJson.str, 'string');
        assert.equal(xJson.str, 'Bob');
      });
    });

    describe('Numbers', function() {
      it('should serialize numbers types properly', function() {
        const modelId = H.uniqueId('model');
        const TestMdl = ottoman.model(modelId, {
          num: 'integer'
        });
        const x = new TestMdl();
        x.num = 44.4;
        const xJson = x.toCoo();

        assert.typeOf(xJson.num, 'number');
        assert.equal(xJson.num, 44.4);
      });

      it('should serialize mixed numbers types properly', function() {
        const modelId = H.uniqueId('model');
        const TestMdl = ottoman.model(modelId, {
          num: 'Mixed'
        });
        const x = new TestMdl();
        x.num = 44.4;
        const xJson = x.toCoo();

        assert.typeOf(xJson.num, 'number');
        assert.equal(xJson.num, 44.4);
      });
    });

    describe('Integers', function() {
      it('should serialize integer types properly', function() {
        const modelId = H.uniqueId('model');
        const TestMdl = ottoman.model(modelId, {
          int: 'integer'
        });
        const x = new TestMdl();
        x.int = 44;
        const xJson = x.toCoo();

        assert.typeOf(xJson.int, 'number');
        assert.equal(xJson.int, 44);
      });

      it('should serialize mixed integer types properly', function() {
        const modelId = H.uniqueId('model');
        const TestMdl = ottoman.model(modelId, {
          int: 'Mixed'
        });
        const x = new TestMdl();
        x.int = 44;
        const xJson = x.toCoo();

        assert.typeOf(xJson.int, 'number');
        assert.equal(xJson.int, 44);
      });
    });

    describe('Booleans', function() {
      it('should serialize boolean types properly', function() {
        const modelId = H.uniqueId('model');
        const TestMdl = ottoman.model(modelId, {
          bool: 'integer'
        });
        const x = new TestMdl();
        x.bool = true;
        const xJson = x.toCoo();

        assert.typeOf(xJson.bool, 'boolean');
        assert.equal(xJson.bool, true);
      });

      it('should serialize mixed boolean types properly', function() {
        const modelId = H.uniqueId('model');
        const TestMdl = ottoman.model(modelId, {
          bool: 'Mixed'
        });
        const x = new TestMdl();
        x.bool = true;
        const xJson = x.toCoo();

        assert.typeOf(xJson.bool, 'boolean');
        assert.equal(xJson.bool, true);
      });
    });
  });

  describe('Json format', function() {
    it('should serialize basic types properly', function() {
      const modelId = H.uniqueId('model');

      const TestMdl = ottoman.model(modelId, {
        name: 'string',
        aDate: 'Date',
        aNum: 'number',
        aBool: 'boolean',
        mixed: 'Mixed',
        subDoc: {
          test: 'string'
        }
      });

      const aDate = new Date();
      const aNum = 3;
      const aBool = false;
      const mixed = 'could have been anything';

      const x = new TestMdl({
        name: 'hello',
        aDate,
        aNum,
        aBool,
        mixed,
        subDoc: {
          test: 'test'
        }
      });
      const xJson = x.toJSON();

      assert.typeOf(xJson, 'object');

      // _type should *not* be there, no internals.
      assert.equal(x._type, undefined);

      assert.typeOf(xJson._id, 'string');
      assert.equal(xJson.name, 'hello');
      assert.equal(xJson.aNum, aNum);
      assert.equal(xJson.aBool, aBool);
      assert.equal(xJson.mixed, mixed);
      assert.equal(xJson.aDate, aDate.toISOString());
      assert.equal(xJson.subDoc.test, 'test');
    });

    it('should serialize references as mongoose references', function() {
      const Account = ottoman.model(H.uniqueId('model'), {
        email: 'string',
        name: 'string'
      });

      const User = ottoman.model(H.uniqueId('model'), {
        username: 'string',
        account: { ref: Account }
      });

      const myAccount = new Account({
        email: 'burtteh@fakemail.com',
        name: 'Brett Lawson'
      });

      const myUser = new User({
        username: 'brett19',
        account: myAccount
      });

      const myUserJson = myUser.toJSON();
      assert.typeOf(myUserJson.account, 'object');
      assert.equal(myUserJson.account.$id, myAccount._id);
      assert.equal(myUserJson.account.$ref, Account.name);
    });

    it('should serialize mixed references correctly', function() {
      const Container = ottoman.model(H.uniqueId('model'), {
        myRef: { ref: 'Mixed' }
      });

      const Platypus = ottoman.model(H.uniqueId('model'), {
        name: { type: 'string', default: 'Steve' }
      });

      const steve = new Platypus({ name: 'Steve' });
      const container = new Container({
        myRef: steve
      });

      const containerJson = container.toJSON();
      assert.typeOf(containerJson.myRef, 'object');
      assert.equal(containerJson.myRef.$id, steve._id);
      assert.equal(containerJson.myRef.$ref, Platypus.name);
    });

    it('should serialize unloaded references as null', function() {
      const Platypus = ottoman.model(H.uniqueId('model'), {
        name: { type: 'string', default: 'Steve' }
      });

      const platypus = Platypus.ref('some-crazy-id');
      const platypusJson = platypus.toJSON();
      assert.equal(platypusJson, null);
    });
  });

  describe('Dates', function() {
    it('should serialize date types properly', function() {
      const modelId = H.uniqueId('model');

      const TestMdl = ottoman.model(modelId, {
        when: 'Date'
      });
      const x = new TestMdl();
      x.when = new Date();
      const xJson = x.toCoo();

      assert.typeOf(xJson.when, 'string');
      assert.equal(xJson.when, x.when.toISOString());
    });

    it('should serialize mixed date types properly', function() {
      const modelId = H.uniqueId('model');

      const TestMdl = ottoman.model(modelId, {
        when: 'Mixed'
      });
      const x = new TestMdl();
      x.when = new Date();
      const xJson = x.toCoo();

      assert.instanceOf(xJson.when, Object);
      assert.equal(xJson.when._type, 'Date');
      assert.equal(xJson.when.v, x.when.toISOString());
    });

    it('should not find mismatching dates', function(done) {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        when: { type: 'Date', default: Date.now }
      });

      const x = new TestMdl();
      const otherDate = new Date('2013-11-11T22:25:42.000Z');

      x.save(function(err) {
        assert.isNull(err);

        TestMdl.find({ when: otherDate }, {}, function(err, res) {
          assert.isNull(err);

          assert.lengthOf(res, 0);
          done();
        });
      });
    });

    it('should only find a matching date', function(done) {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        when: { type: 'Date', default: Date.now }
      });

      const someWhen = new Date('2013-11-11T22:25:42.000Z');
      const x = new TestMdl();
      const y = new TestMdl({ when: someWhen });

      x.save(function(err) {
        assert.isNull(err);

        y.save(function(err) {
          assert.isNull(err);

          TestMdl.find({ when: someWhen }, {}, function(err, res) {
            assert.isNull(err);

            assert.lengthOf(res, 1);
            done();
          });
        });
      });
    });
  });

  describe('Groups', function() {
    it('should serialize groups properly', function() {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        who: {
          name: 'string'
        }
      });
      const x = new TestMdl();
      x.who.name = 'George';
      const xJson = x.toCoo();

      assert.instanceOf(xJson.who, Object);
      assert.equal(xJson.who.name, 'George');
    });
  });

  describe('Types', function() {
    it('should use types by name properly', function() {
      const typeId = H.uniqueId('type');
      const modelId = H.uniqueId('model');
      ottoman.type(typeId, {
        type: 'string'
      });
      const TestMdl = ottoman.model(modelId, {
        name: typeId
      });
      const x = new TestMdl();
      x.name = 'George';
      const xJson = x.toCoo();
      assert.typeOf(xJson.name, 'string');
    });

    it('should use types by reference properly', function() {
      const typeId = H.uniqueId('type');
      const modelId = H.uniqueId('model');
      const TestType = ottoman.type(typeId, 'string');
      const TestMdl = ottoman.model(modelId, {
        name: TestType
      });
      const x = new TestMdl();
      x.name = 'George';
      const xJson = x.toCoo();
      assert.typeOf(xJson.name, 'string');
    });
  });

  describe('Defaults', function() {
    it('should work with default string values', function() {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        name: { type: 'string', default: 'Frank' }
      });
      const x = new TestMdl();
      const xJson = x.toCoo();

      assert.typeOf(xJson.name, 'string');
      assert.equal(xJson.name, 'Frank');
    });

    it('should work with default number values', function() {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        num: { type: 'number', default: 14.4 }
      });
      const x = new TestMdl();
      const xJson = x.toCoo();

      assert.typeOf(xJson.num, 'number');
      assert.equal(xJson.num, 14.4);
    });

    it('should work with default date values', function() {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        when: { type: 'Date', default: new Date() }
      });
      const x = new TestMdl();
      const xJson = x.toCoo();

      assert.typeOf(xJson.when, 'string');
      assert.equal(xJson.when, x.when.toISOString());
    });

    it('should work with default value functions', function() {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        num: {
          type: 'number',
          default() {
            return 19.3;
          }
        }
      });
      const x = new TestMdl();
      const xJson = x.toCoo();

      assert.typeOf(xJson.num, 'number');
      assert.equal(xJson.num, 19.3);
    });

    it('should work with default falsy value', function() {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(modelId, {
        num: { type: 'number', default: 0 },
        bool: { type: 'boolean', default: false }
      });
      const x = new TestMdl();
      const xJson = x.toCoo();

      assert.typeOf(xJson.num, 'number');
      assert.equal(xJson.num, 0);
      assert.typeOf(xJson.bool, 'boolean');
      assert.equal(xJson.bool, false);
    });
  });

  describe('Ids', function() {
    it('should fail if the model defines an id property', function() {
      assert.throws(function() {
        const modelId = H.uniqueId('model');
        ottoman.model(modelId, {
          id: 'string'
        });
      }, Error);
    });

    it('should accept custom id properties', function() {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(
        modelId,
        {
          customId: { type: 'string', auto: 'uuid', readonly: true }
        },
        {
          id: 'customId'
        }
      );
      const x = new TestMdl();
      const xJson = x.toCoo();

      assert.notProperty(xJson, '_id');
      assert.equal(xJson.customId, x.customId);
    });

    it('should accept custom id properties inside groups', function() {
      const modelId = H.uniqueId('model');
      const TestMdl = ottoman.model(
        modelId,
        {
          test: {
            customId: { type: 'string', auto: 'uuid', readonly: true }
          }
        },
        {
          id: 'test.customId'
        }
      );
      const x = new TestMdl();
      const xJson = x.toCoo();

      assert.notProperty(xJson, '_id');
      assert.equal(xJson.test.customId, x.test.customId);
    });
  });

  it('should have a working custom inspector', function() {
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(modelId, {
      name: 'string',
      test: {
        jayd: 'string'
      }
    });
    const x = new TestMdl();
    x.inspect();

    const y = TestMdl.ref('11');
    y.inspect();
  });

  it('should successfully save and load an object', function(done) {
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    const x = new TestMdl();
    x.name = 'George';

    x.save(function(err) {
      assert.isNull(err);

      const y = TestMdl.ref(x._id);
      y.load(function(err) {
        assert.isNull(err);

        assert.instanceOf(y, TestMdl);
        assert.equal(x._id, y._id);
        assert.equal(x.name, y.name);
        done();
      });
    });
  });

  it('should successfully update an object', function(done) {
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    const x = new TestMdl();
    x.name = 'George';

    x.save(function(err) {
      assert.isNull(err);

      const y = TestMdl.ref(x._id);
      y.load(function(err) {
        assert.isNull(err);

        assert.instanceOf(y, TestMdl);
        assert.equal(x._id, y._id);
        assert.equal(x.name, y.name);
        y.name = 'Not George';
        y.save(function(err) {
          assert.isNull(err);

          const z = TestMdl.ref(x._id);
          z.load(function(err) {
            assert.isNull(err);

            assert.instanceOf(y, TestMdl);
            assert.equal(y._id, z._id);
            assert.equal(y.name, z.name);
            done();
          });
        });
      });
    });
  });

  it('should correctly advertise .loaded()', function(done) {
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    const x = new TestMdl();
    x.name = 'George';

    assert.isTrue(x.loaded());

    x.save(function(err) {
      assert.isNull(err);
      assert.isTrue(x.loaded());

      const y = TestMdl.ref(x._id);
      assert.isFalse(y.loaded());
      y.load(function(err) {
        assert.isNull(err);
        assert.isTrue(y.loaded());

        done();
      });
    });
  });

  it('should successfully load object with getById', function(done) {
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    const x = new TestMdl();
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
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    const x = new TestMdl();
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
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(
      modelId,
      {
        name: 'string'
      },
      {
        index: {
          findByName: {
            type: 'refdoc',
            by: 'name'
          }
        }
      }
    );

    const x = new TestMdl();
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
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    const y = TestMdl.ref('INVALID ID');
    y.load(function(err) {
      assert.isNotNull(err);
      done();
    });
  });

  it('should fail getById with invalid id', function(done) {
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    TestMdl.getById('INVALID ID', function(err) {
      assert.isNotNull(err);
      done();
    });
  });

  it('should allow constructor options', function() {
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(modelId, {
      name: 'string'
    });

    const x = new TestMdl({ name: 'Joseph' });
    assert.equal(x.name, 'Joseph');
  });

  it('should validate a model', function(done) {
    const modelId = H.uniqueId('model');
    let called = false;
    const TestMdl = ottoman.model(modelId, {
      name: {
        type: 'string',
        validator(value) {
          if (typeof value !== 'string') {
            throw new Error('bad data');
          } else {
            called = true;
          }
        }
      }
    });

    const x = new TestMdl({ name: 'Joseph' });
    ottoman.validate(x, function(err) {
      assert.isNull(err);
      assert.equal(called, true);
      done();
    });
  });

  it('should fail to validate bad data', function(done) {
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(modelId, {
      name: {
        type: 'string',
        validator(value) {
          if (typeof value !== 'string') {
            throw new Error('bad data');
          }
        }
      }
    });

    const x = new TestMdl({ name: 'Joseph' });
    x.name = 1;
    ottoman.validate(x, function(err) {
      assert.isNotNull(err);
      done();
    });
  });

  it('should validate a model to all depths', function(done) {
    const modelId = H.uniqueId('model');
    let called = false;
    const TestMdl = ottoman.model(modelId, {
      person: {
        name: {
          type: 'string',
          validator(value) {
            if (typeof value !== 'string') {
              throw new Error('bad data');
            } else {
              called = true;
            }
          }
        }
      }
    });

    const x = new TestMdl({ person: { name: 'Joseph' } });
    ottoman.validate(x, function(err) {
      assert.isNull(err);
      assert.equal(called, true);
      done();
    });
  });

  // null subdocs without a validator should pass through unharmed
  it('should validate a model to all depths unless null subdocs have no validator', function(done) {
    const modelId = H.uniqueId('model');
    const TestMdl = ottoman.model(modelId, {
      person: {
        notes: { type: 'string' },
        info: {
          name: {
            type: 'string'
          }
        }
      }
    });
    // leaving off the person.info.name bit should be ok in this case
    const x = new TestMdl({ person: { notes: 'goes by joe' } });
    ottoman.validate(x, function(err) {
      assert.isNull(err);
      done();
    });
  });

  // A model instance may have a null subdoc that needs to be validated
  it('should validate a model to all depths and handle null subdocs', function(done) {
    const modelId = H.uniqueId('model');
    let called = false;
    const TestMdl = ottoman.model(modelId, {
      person: {
        notes: { type: 'string' },
        info: {
          name: {
            type: 'string',
            validator(value) {
              if (typeof value !== 'string') {
                called = true;
                throw new Error('bad data');
              }
            }
          }
        }
      }
    });
    // leaving off the name field is not ok here because info is null
    const x = new TestMdl({ person: { notes: 'goes by joe' } });
    ottoman.validate(x, function(err) {
      assert.isNotNull(err);
      assert.equal(called, true);
      done();
    });
  });
});
