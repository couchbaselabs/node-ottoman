var expect = require('chai').expect;
var Ottoman = require('../lib/ottoman');
var H = require('../test_harness');
var V = Ottoman.Validator;

describe('#querying', function(){
  it('should support simple queries', function(done) {
    var userModelName = H.uniqueId('model');
    var postModelName = H.uniqueId('model');

    var User = Ottoman.model(userModelName, {
      name: 'string'
    }, {
      constructor: function(name) {
        this.name = name;
      },
      queries: {
        myPosts: {
          target: postModelName,
          mappedBy: 'creator',
          sort: 'desc',
          limit: 5
        }
      },
      bucket: H.bucket
    });

    var Post = Ottoman.model(postModelName, {
      title: 'string',
      creator: userModelName
    }, {
      bucket: H.bucket
    });

    var test = new User();
    test.name = 'brett19';

    var post1 = new Post();
    post1.title = 'Post 1';
    post1.creator = test;
    var post2 = new Post();
    post2.title = 'Post 2';
    post2.creator = test;

    Ottoman.registerDesignDocs(function(err) {
      expect(err).to.be.null;

      Ottoman.save([test, post1, post2], function(err) {
        expect(err).to.be.null;

        test.myPosts(function(err, posts) {
          expect(err).to.be.null;

          Ottoman.load(posts, function(err) {
            expect(err).to.be.null;

            expect(posts).to.have.length(2);
            for (var i = 0; i < posts.length; ++i) {
              expect(posts[i].creator).to.equal(test);
            }

            done();
          });
        });
      })
    });
  });

  it.skip('should support referential documents', function(done) {
    var userModelName = H.uniqueId('model');
    var nameKeyPrefix = H.uniqueId('kp');

    var User = Ottoman.model(userModelName, {
      name: 'string'
    }, {
      constructor: function(name) {
        this.name = name;
      },
      indexes: {
        getByName: {
          type: 'refdoc',
          key: ['name']
        }
      },
      bucket: H.bucket
    });

    var test = new User();
    test.name = 'brett19';

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      User.getByName('brett19', function(err, doc) {
        console.log(H.bucket.values);
        console.log('getByName', err, doc);
        done();
      });
    });
  });

  it.skip('should support referential documents with custom key prefixes', function(done) {
    var userModelName = H.uniqueId('model');
    var nameKeyPrefix = H.uniqueId('kp');

    var User = Ottoman.model(userModelName, {
      name: 'string'
    }, {
      constructor: function(name) {
        this.name = name;
      },
      indexes: {
        getByName: {
          type: 'refdoc',
          key: ['name'],
          keyPrefix: nameKeyPrefix
        }
      },
      bucket: H.bucket
    });

    var test = new User();
    test.name = 'brett19';

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      User.getByName('brett19', function(err, doc) {
        expect(err).to.be.null;
        expect(test._id).to.equal(doc._id);

        console.log(H.bucket.values);
        console.log('getByName', err, doc);
        done();
      });
    });
  });

  it('should support referential documents with multiple keys', function(done) {
    var userModelName = H.uniqueId('model');
    var nameKeyPrefix = H.uniqueId('kp');

    var User = Ottoman.model(userModelName, {
      fname: 'string',
      lname: 'string'
    }, {
      constructor: function(fname, lname) {
        this.fname = fname;
        this.lname = lname;
      },
      indexes: {
        getByName: {
          type: 'refdoc',
          key: ['fname', 'lname'],
          keyPrefix: nameKeyPrefix
        }
      },
      bucket: H.bucket
    });

    var test = new User();
    test.fname = 'brett';
    test.lname = 'lawson';

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      User.getByName('brett', 'lawson', function(err, doc) {
        expect(err).to.be.null;
        expect(test._id).to.equal(doc._id);

        console.log(H.bucket.values);
        console.log('getByName', err, doc);
        done();
      });
    });
  });

  it.skip('should support handle referential document conflicts', function(done) {
    var userModelName = H.uniqueId('model');
    var nameKeyPrefix = H.uniqueId('kp');

    var User = Ottoman.model(userModelName, {
      name: 'string'
    }, {
      constructor: function(name) {
        this.name = name;
      },
      indexes: {
        getByName: {
          type: 'refdoc',
          key: ['name'],
          keyPrefix: nameKeyPrefix
        }
      },
      bucket: H.bucket
    });

    var test = new User();
    test.name = 'brett19';

    Ottoman.save(test, function(err) {
      expect(err).to.be.null;

      test.name = 'frank';

      Ottoman.save(test, function(err) {
        expect(err).to.be.null;

        var test2 = new User();
        test2.name = 'brett19';

        Ottoman.save(test2, function(err) {
          expect(err).to.be.null;

          test2.name = 'frank';

          Ottoman.save(test2, function(err) {
            expect(err).to.exist;

            done();
          });
        });
      });
    });
  });


});