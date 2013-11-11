var expect = require('chai').expect;
var Ottoman = require('../lib/ottoman');
var H = require('../test_harness');

describe('#basic', function(){
  it('should handle storage/retrieval of simple models', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'name': 'string'
    }, {
      bucket: H.bucket
    });

    var test = new MyModel();
    test.name = 'Brett';

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      MyModel.findById(test._id, function(err, obj) {
        expect(err).to.be.null;
        expect(obj).to.eql(test);

        done();
      });
    });

  });

  it('should fail to register the same model name twice', function(done) {
    var modelName = H.uniqueId('model');

    function registerMyModel() {
      Ottoman.model(modelName, {
        'name': 'string'
      }, {
        bucket: H.bucket
      });
    }

    expect(registerMyModel).not.to.throw();
    expect(registerMyModel).to.throw(Error);
    done();
  });

  it('should reuse objects during deserialization', function(done) {
    var modelName = H.uniqueId('model');
    var refModelName = H.uniqueId('model');

    var MyRefModel = Ottoman.model(refModelName, {
      'name': 'string'
    }, {
      bucket: H.bucket
    });
    var MyModel = Ottoman.model(modelName, {
      'refOne': refModelName,
      'refTwo': refModelName
    }, {
      bucket: H.bucket
    });

    var refTest = new MyRefModel();
    refTest.name = 'Franklin';

    var myTest = new MyModel();
    myTest.refOne = refTest;
    myTest.refTwo = refTest;

    Ottoman.save(myTest, function(err) {
      expect(err).to.be.null;

      MyModel.findById(myTest._id, function(err, obj) {
        expect(err).to.be.null;

        expect(obj.refOne).to.equal(obj.refTwo);
        done();
      });
    });

  });
});
