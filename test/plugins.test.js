var chai = require('chai');
var expect = chai.expect;
var H = require('./harness');
var ottoman = H.lib;

function makeAMockModel() {
  var mock = H.uniqueId('mock');
  var Mock = ottoman.model(mock, {
    email: 'string',
    name: 'string'
  });

  return Mock;
}

function dummyPlugin() {
  var p = function (model, options) {
    options.called = true;
    return this;
  }

  return p;
}

/**
 * Tests for the Ottoman plugin system.
 * Because the ottoman plugin system is derived in part from how Mongoose works,
 * the sample use cases shown on their plugins page form a baseline for how to
 * test this:
 * http://mongoosejs.com/docs/plugins.html
 */
describe('Ottoman Plugins', function () {
  beforeEach(function (done) {
    ottoman.plugins = [];
    done();
  });

  it('should register global, but not call it immediately', function (done) {
    var plugin = dummyPlugin();
    var watch = { called: false };
    ottoman.plugin(plugin, watch);
    expect(watch.called).to.be.false;
    done();
  });

  it('global plugins must be functions', function (done) {
    expect(function () {
      ottoman.plugin({}, {});
    }).to.throw(Error);

    expect(function () {
      ottoman.plugin('Hello, World!');
    }).to.throw(Error);

    expect(function () {
      ottoman.plugin(null);
    }).to.throw(Error);

    done();
  });

  // Note that these tests, by passing a "watch" variable that gets modified,
  // also prove that the plugin is called with specified arguments, so that's
  // not a separate unit test.
  it('should register model plugin, and call it immediately', function (done) {
    var plugin = dummyPlugin();
    var model = makeAMockModel();
    var watch = { called: false };
    model.plugin(plugin, watch);
    expect(watch.called).to.be.true;
    done();
  });

  it('should provide the model when calling plugin', function (done) {
    var model = null;

    function pluginFn(modelArg, options) {
      // Here, I want == and **not** === because I want reference equality */
      /* eslint eqeqeq: "off" */
      if (modelArg == model) {
        options.good = true;
      }
    }

    var watch = { good: false };
    model = makeAMockModel();
    model.plugin(pluginFn, watch);

    expect(watch.good).to.be.true;
    done();
  });

  it('should let models inherit global plugins', function (done) {
    var plugin = dummyPlugin();
    var watch = { called: false };

    // Register a global plugin.
    ottoman.plugin(plugin, watch);

    // Didn't get called globally.
    expect(watch.called).to.be.false;

    // Define some model, don't care which.
    // On that definition, plugin should auto-run on it.
    makeAMockModel();

    // On model registration, plugin got called.
    expect(watch.called).to.be.true;

    done();
  });

  it('should allow an arbitrary number of plugins', function (done) {
    function pluginFn(model, options) {
      options.counter = options.counter + 1;
    }

    var watch = { counter: 0 };

    for (var i = 0; i < 100; i++) {
      ottoman.plugin(pluginFn, watch);
    }

    makeAMockModel();

    expect(watch.counter).to.equal(100);
    done();
  });

  it('should work properly with an ottoman event', function (done) {
    function fooSetterPlugin(model, options) {
      model.pre('save', function (modelInstance, next) {
        modelInstance.foo = options.foo;
        next();
      });
    }

    var mock = H.uniqueId('mock');
    var Mock = ottoman.model(mock, {
      x: 'string',
      foo: { type: 'string', default: null }
    });

    Mock.plugin(fooSetterPlugin, { foo: 'bar' });

    var myMock = new Mock({ x: 'hello' });
    myMock.save(function (err) {
      if (err) { return done(err); }

      expect(myMock.foo).to.equal('bar');
      done();
    });
  });
});
