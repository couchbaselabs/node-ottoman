'use strict';

var chai = require('chai');
var expect = chai.expect;
var ottopath = require('../lib/ottopath/ottopath');

describe('Ottopath', function () {
  it('should parse correctly', function (done) {
    var input = 'creator.$ref';
    var result = ottopath.parse(input);

    expect(result).to.be.an.instanceof(ottopath.Path);
    expect(result).to.be.ok;

    expect(result.length).to.be.above(0);

    for (var i = 0; i < result.length; i++) {
      var o = result[i];
      expect(o).to.be.an('object');
      expect(o).to.have.all.keys(['operation', 'expression']);
      expect(o.operation).to.equal('member');
      expect(o.expression.type).to.equal('identifier');
    }

    expect(result[0].expression.value).to.equal('creator');
    expect(result[1].expression.value).to.equal('$ref');

    done();
  });

  it('should stringify', function (done) {
    var input = 'creator.$ref';
    var result = ottopath.parse(input);
    var out = result.toString()

    expect(out).to.equal('creator.$ref');
    done();
  });

  it('stringify should throw Error on bad data', function (done) {
    var input = 'creator.$ref';
    var result = ottopath.parse(input);
    result[0].expression.type = 'totally illegal';

    expect(function () { result.toString(); })
      .to.throw(Error);
    done();
  });
});
