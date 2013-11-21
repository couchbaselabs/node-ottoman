var expect = require('chai').expect;
var Ottoman = require('../lib/ottoman');
var H = require('../test_harness');

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

    console.log(post1, post2);

    Ottoman.registerDesignDocs(function(err) {
      expect(err).to.be.null;

      Ottoman.save([test, post1, post2], function(err) {
        expect(err).to.be.null;

        test.myPosts(function(err, posts) {
          expect(err).to.be.null;

          Ottoman.load(posts, function(err) {
            expect(err).to.be.null;

            console.log(posts);
            done();
          });
        });
      })
    });
  });

});