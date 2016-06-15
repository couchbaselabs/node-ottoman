var chai = require('chai');
var expect = chai.expect;
var H = require('./harness');
var ottoman = H.lib;

describe('Model references', function () {
  this.timeout(2000000);

  var idA = H.uniqueId('model');
  var idB = H.uniqueId('model');
  var idC = H.uniqueId('model');

  var Account = ottoman.model(idA, {
    email: 'string',
    name: 'string'
  });

  var User = ottoman.model(idB, {
    username: 'string',
    account: { ref: Account },
  }, {
      index: {
        findByUsername: {
          type: 'n1ql',
          by: 'username',
          consistency: ottoman.Consistency.GLOBAL,
        }
      }
    });

  var MultiAccountUser = ottoman.model(idC, {
    username: 'string',
    accounts: [ {ref: Account }]
  }, {
    index: {
      findByUsername: {
        type: 'n1ql',
        by: 'username',
        consistency: ottoman.Consistency.GLOBAL,
      }
    }
  })

  before(function (done) {
    ottoman.ensureIndices(function (err) {
      if (err) { return done(err); }
      setTimeout(function () { done(); }, 2000);
    });
  });

  it('shouldn\'t require reference to be present', function (done) {
    var notLinked = new User({
      username: 'foo',
    });

    notLinked.save(function (err) {
      if (err) { return done(err); }

      expect(notLinked.username).to.be.ok;
      done();
    });
  });

  it('should permit referencing two models together', function (done) {
    var myAccount = new Account({
      email: 'burtteh@fakemail.com',
      name: 'Brett Lawson'
    });

    var myUser = new User({
      username: 'brett19',
      account: myAccount,
    });

    myAccount.save(function (err) {
      if (err) { return done(err); }

      myUser.save(function (err) {
        if (err) { return done(err); }

        User.findByUsername('brett19', function (err, myUsers) {
          // console.log('USERS: ' + JSON.stringify(myUsers));
          expect(myUsers).to.be.an('array');
          expect(myUsers.length).to.equal(1);

          var myUser = myUsers[0];

          // console.log(JSON.stringify(myUser));
          // console.log('Loaded? ' + myUser.account.loaded());
          expect(myUser.account.loaded()).to.be.false;

          myUser.account.load(function (err) {
            expect(myUser.account.email).to.equal('burtteh@fakemail.com');
            done();
          });
        });
      });
    });
  });

  it('should allow re-linking of models', function (done) {
    var notLinked = new User({
      username: 'relink',
    });

    notLinked.save(function (err) {
      if (err) { return done(err); }

      expect(notLinked.username).to.be.ok;

      var newLinkage = new Account({
        email: 'foo@bar.com',
        name: 'Foobar',
      });

      newLinkage.save(function (err) {
        if (err) { return done(err); }

        notLinked.account = newLinkage;

        notLinked.save(function (err) {
          if (err) { return done(err); }

          User.findByUsername('relink', function (err, users) {
            expect(users).to.be.an('array');
            expect(users.length).to.equal(1);
            var relinked = users[0];

            expect(relinked.account.loaded()).to.be.false;
            expect(relinked.account).to.be.ok;

            relinked.account.load(function (err) {
              if (err) { return done(err); }

              expect(relinked.account.email).to.equal('foo@bar.com');
              done();
            });
          });
        });
      });
    });
  });

  it('should allow one-to-many linkages', function (done) {

    var account1 = new Account({
      email: 'account1@fake.com',
      name: 'Account1'
    });

    var account2 = new Account({
      email: 'account2@fake.com',
      name: 'Account2'
    });

    var myUser = new MultiAccountUser({
      username: 'multi-account',
      accounts: [account1, account2]
    });

    var toSave = [account1, account2, myUser];
    var saved = 0;

    function proceed () {
      MultiAccountUser.findByUsername('multi-account', function (err, users) {
        if (err) { return done(err); }
        expect(users).to.be.an('array');
        expect(users.length).to.equal(1);

        var multiUser = users[0];

        expect(multiUser.accounts).to.be.an('array');
        expect(multiUser.accounts.length).to.equal(2);

        for(var i=0; i<multiUser.accounts.length; i++) {

          expect(multiUser.accounts[i].loaded()).to.be.false;
        }

        done();
      });
    }

    function saveCallback(err) {
      if (err) { return done(err); }

      saved++;
      if(saved === toSave.length) {
        proceed();
      }
    }

    toSave.forEach(function (model) {
      model.save(saveCallback);
    });
  });
});
