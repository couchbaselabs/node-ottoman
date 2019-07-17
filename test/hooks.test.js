const chai = require('chai');

const expect = chai.expect;
const H = require('./harness');

const ottoman = H.lib;

/*
 * Tests to ensure that pre/post hooks are executed as promised by
 * ottoman.
 *
 * Concept here is to take a simple model through the entire lifecycle
 * of creation and deletion and check that a spy function was called.
 */
describe('Model hooks', function() {
  this.timeout(10000);

  const milestones = ['pre', 'post'];
  const events = ['validate', 'save', 'load', 'remove'];

  const testMilestoneEvent = function(milestone, event) {
    it(`should trigger callbacks on ${milestone}-${event}`, function(done) {
      let called = false;

      const callMeOnEvent = function(mdlInst, next) {
        // console.log('I got called: ' + milestone + ' ' + event);
        called = true;
        next();
      };

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
              by: 'name',
              consistency: ottoman.Consistency.GLOBAL
            }
          }
        }
      );

      const x = new TestMdl();
      const searchStr = `Hello ${Math.random()}`;
      x.name = searchStr;

      // Set hanlder...
      TestMdl[milestone](event, callMeOnEvent);

      // Now save and load to make sure all lifecycle would be covered.
      x.save(function(err) {
        expect(err).to.be.null;

        if (called) {
          return done();
        }

        // Now search for it.
        TestMdl.findByName(searchStr, function(err, res) {
          expect(err).to.be.null;
          expect(res).to.be.an('array');
          expect(res.length).to.equal(1);

          if (called) {
            return done();
          }

          // Finally remove it.
          res[0].remove(function(err) {
            expect(err).to.be.null;
            expect(called).to.be.true;

            return done();
          });
        });
      });
    });
  };

  for (let x = 0; x < milestones.length; x++) {
    const milestone = milestones[x];

    for (let y = 0; y < events.length; y++) {
      const event = events[y];

      testMilestoneEvent(milestone, event);
    }
  }
});
