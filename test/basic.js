var expect = require('chai').expect;
var Ottoman = require('../lib/ottoman');
var H = require('../test_harness');
var V = Ottoman.Validator;

describe('#basic', function(){
  it('should handle storage/retrieval of basic types', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'str': 'string',
      'boolt': 'boolean',
      'boolf': 'boolean',
      'int': 'integer',
      'num': 'number',
      'map': 'Map',
      'lst': 'List'
    }, {
      bucket: H.bucket
    });

    var test = new MyModel();
    test.str = 'Brett';
    test.boolt = true;
    test.boolf = false;
    test.int = 14;
    test.num = 99.98273;
    test.lst = [12,44,99];
    test.map = {bob:'frank', john:'doe'};

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      MyModel.findById(test._id, function(err, obj) {
        expect(err).to.be.null;
        expect(obj.str).to.be.a('string');
        expect(obj.boolt).to.be.a('boolean');
        expect(obj.boolf).to.be.a('boolean');
        expect(obj.int).to.be.a('number');
        expect(obj.num).to.be.a('number');
        expect(obj.lst).to.be.a('Array');
        expect(obj.map).to.be.a('Object');
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
    expect(registerMyModel).to.throw(Error, /already registered/);

    done();
  });

  it('should allow loading of referenced objects', function(done) {
    var modelName = H.uniqueId('model');
    var refModelName = H.uniqueId('model');

    var MyRefModel = Ottoman.model(refModelName, {
      'name': 'string'
    }, {
      bucket: H.bucket
    });
    var MyModel = Ottoman.model(modelName, {
      'refObj': refModelName
    }, {
      bucket: H.bucket
    });

    var refTest = new MyRefModel();
    refTest.name = 'Fudgebars';

    var myTest = new MyModel();
    myTest.refObj = refTest;

    Ottoman.save(myTest, function(err) {
      expect(err).to.be.null;

      MyModel.findById(myTest._id, function(err, obj) {
        expect(err).to.be.null;

        Ottoman.load(obj.refObj, function(err) {
          expect(err).to.be.null;
          expect(obj.refObj.name).to.equal('Fudgebars');

          done();
        });
      });
    });
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

  it('should callback even with no changes to save', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'name': String
    }, {
      bucket: H.bucket
    });

    var test = new MyModel();
    test.name = 'Matt';

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      Ottoman.save(test, function(err) {
        expect(err).to.be.null;

        done();
      });
    })
  });

  it('should be able to handle direct type references', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'name': String
    }, {
      bucket: H.bucket
    });

    var test = new MyModel();
    test.name = 'Matt';

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      MyModel.findById(test._id, function(err, obj) {
        expect(err).to.be.null;
        expect(obj.name).to.be.a('string');
        expect(obj.name).to.equal('Matt');

        done();
      });
    })
  });

  it('should be able to handle self references', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'name': 'string',
      'self': modelName
    }, {
      bucket: H.bucket
    });

    var test = new MyModel();
    test.name = 'Matt';
    test.self = test;

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      MyModel.findById(test._id, function(err, obj) {
        expect(err).to.be.null;
        expect(obj.self).to.equal(obj);

        done();
      });
    })
  });

  it('should be able to handle circular references', function(done) {
    var modelName = H.uniqueId('model');
    var refModelName = H.uniqueId('model');

    var MyRefModel = Ottoman.model(refModelName, {
      'name': 'string',
      'parent': modelName
    }, {
      bucket: H.bucket
    });
    var MyModel = Ottoman.model(modelName, {
      'child': refModelName
    }, {
      bucket: H.bucket
    });

    var refTest = new MyRefModel();
    var myTest = new MyModel();
    myTest.child = refTest;
    refTest.name = 'Darling';
    refTest.parent = myTest;

    Ottoman.save(myTest, function(err) {
      expect(err).to.be.null;

      MyModel.findById(myTest._id, function(err, obj) {
        expect(err).to.be.null;

        Ottoman.load(obj.child, function(err) {
          expect(err).to.be.null;
          expect(obj.child.parent).to.equal(obj);

          done();
        });
      });
    });
  });

  it('should fail to deserialize another type', function(done) {
    var modelNameOne = H.uniqueId('model');
    var modelNameTwo = H.uniqueId('model');

    var MyModelOne = Ottoman.model(modelNameOne, {
      'name': 'string'
    }, {
      bucket: H.bucket
    });
    var MyModelTwo = Ottoman.model(modelNameTwo, {
      'name': 'string'
    }, {
      bucket: H.bucket
    });

    var test = new MyModelOne();
    test.name = 'Joseph';

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      MyModelTwo.findById(test._id, function(err, obj) {
        expect(err).to.exist;
        expect(err.code).to.equal(H.cbErrors.keyNotFound);

        done();
      });
    });
  });

  it('should call constructor', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'name': { type: 'string' }
    }, {
      constructor: function(name) {
        this.name = name;
      },
      bucket: H.bucket
    });

    var test = new MyModel('Josephina');
    expect(test.name).to.equal('Josephina');

    done();
  });

  it('should enforce readonly attribute', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'name': { type: 'string', readonly: true }
    }, {
      constructor: function(name) {
        this.name = name;
      },
      bucket: H.bucket
    });

    var test = new MyModel('Franklin');

    function testNameChange() {
      test.name = 'Bobby';
    }
    expect(testNameChange).to.throw(Error, /read\-only/);
    expect(test.name).to.equal('Franklin');

    done();
  });

  it('should support alternate type descriminators', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'name': 'string'
    }, {
      descriminators: {
        descrimTestField: modelName + 'Descrim'
      },
      bucket: H.bucket
    });

    var test = new MyModel();
    test.name = 'Mike';

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      H.bucket.get(Ottoman.key(test), {}, function(err, result) {
        expect(err).to.be.null;
        expect(result.value._type).to.be.undefined;
        expect(result.value.descrimTestField).to.equal(modelName + 'Descrim');

        done();
      });
    });
  });

  it('should deserialized mixed lists', function(done) {
    var modelNameOne = H.uniqueId('model');
    var modelNameTwo = H.uniqueId('model');
    var modelNameThree = H.uniqueId('model');

    var MyModelOne = Ottoman.model(modelNameOne, {
      'mixedlst': { type: 'List', subtype:'Mixed' }
    }, {
      bucket: H.bucket
    });
    var MyModelTwo = Ottoman.model(modelNameTwo, {
      'name': 'string'
    }, {
      bucket: H.bucket
    });
    var MyModelThree = Ottoman.model(modelNameThree, {
      'email': 'string'
    }, {
      bucket: H.bucket
    });

    var testRefTwo = new MyModelTwo();
    testRefTwo.name = 'Joe';
    var testRefThree = new MyModelThree();
    testRefThree.email = 'joe@test.com';

    var test = new MyModelOne();
    test.mixedlst = [testRefTwo, testRefThree];

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      MyModelOne.findById(test._id, function(err, obj) {
        expect(err).to.be.null;
        expect(obj.mixedlst[0]).to.be.an.instanceof(MyModelTwo);
        expect(obj.mixedlst[1]).to.be.an.instanceof(MyModelThree);

        done();
      });
    })
  });

  it('should support field aliasing', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'name': { type: 'string', name: 'n' },
      'email': { type: 'string', name: 'e' }
    }, {
      bucket: H.bucket
    });

    var test = new MyModel();
    test.name = 'Michael';
    test.email = 'mick@test.com';

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      MyModel.findById(test._id, function(err, obj) {
        expect(err).to.be.null;
        expect(obj).to.eql(test);

        H.bucket.get(Ottoman.key(test), {}, function(err, result) {
          expect(err).to.be.null;
          expect(result.value.n).to.equal(test.name);
          expect(result.value.e).to.equal(test.email);

          done();
        });
      });
    });
  });

  it('should not allow fields to share an alias', function(done){
    var modelName = H.uniqueId('model');

    function registerModel() {
      var MyModel = Ottoman.model(modelName, {
        'name': { type: 'string', name: 'n' },
        'number': { type: 'string', name: 'n' }
      }, {
        bucket: H.bucket
      });
    };
    expect(registerModel).to.throw(Error, /multiple/);

    done();
  });

  it('should allow custom id fields', function(done){
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'myId': { type: 'string', readonly: true },
      'name': { type: 'string', name: 'n' }
    }, {
      constructor: function(myId) {
        this.myId = myId;
      },
      id: ['myId'],
      bucket: H.bucket
    });

    var randomId = H.uniqueId('id');
    var test = new MyModel(randomId);
    test.name = 'Bobby';

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      H.bucket.get(Ottoman.key(test), {}, function(err, result) {
        expect(err).to.be.null;
        expect(result.value._id).to.be.undefined;
        expect(result.value.myId).to.equal(randomId);

        done();
      });
    });
  });

  it('should enforce custom ids being readonly', function(done) {
    var modelName = H.uniqueId('model');

    function registerModel() {
      var MyModel = Ottoman.model(modelName, {
        'myId': { type: 'string' },
        'name': { type: 'string' }
      }, {
        constructor: function(myId) {
          this.myId = myId;
        },
        id: ['myId'],
        bucket: H.bucket
      });
    }
    expect(registerModel).to.throw(Error, /readonly/);

    done();
  });

  it('should have an accurate name', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'name': 'string'
    }, {
      bucket: H.bucket
    });

    expect(MyModel.name).to.equal(modelName);

    done();
  });

  it('should support Date types', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'name': 'string',
      'lastLogin': 'Date',
      'mixedDate': 'Mixed'
    }, {
      bucket: H.bucket
    });

    var test = new MyModel();
    test.name = 'Bratok';
    test.lastLogin = new Date();
    test.mixedDate = new Date();

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      MyModel.findById(test._id, function(err, obj) {
        expect(err).to.be.null;
        expect(obj.lastLogin).to.be.an.instanceof(Date);
        expect(obj.mixedDate).to.be.an.instanceof(Date);
        expect(obj).to.eql(test);

        done();
      });
    });
  });

  it('should support validators', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'val': { type: 'integer', validator: V.min(100) }
    }, {
      bucket: H.bucket
    });

    var test = new MyModel();

    test.val = 99;
    Ottoman.save(test, function(err) {
      expect(err).to.exist;

      test.val = 100;
      Ottoman.save(test, function(err) {
        expect(err).to.be.null;

        test.val = 101;
        Ottoman.save(test, function(err) {
          expect(err).to.be.null;

          done();
        });
      });
    })
  });

  it('should allow private fields to restrict toJSON values', function(done) {
    var modelName = H.uniqueId('model');

    var MyModel = Ottoman.model(modelName, {
      'valx': { type: 'integer', private: true },
      'valy': { type: 'integer', private: false },
      'valz': { type: 'integer' }
    }, {
      bucket: H.bucket
    });

    var test = new MyModel();
    test.valx = 19;
    test.valy = 32;
    test.valz = 65;

    var objy = test.toJSON();
    var objz = test.toJSON(true);

    expect(objy.valx).to.not.exist;
    expect(objy.valy).to.exist;
    expect(objy.valz).to.exist;

    expect(objz.valx).to.exist;
    expect(objz.valy).to.exist;
    expect(objz.valz).to.exist;

    expect(JSON.stringify(objy)).to.equal(JSON.stringify(test.toJSON()));

    done();
  });
});
