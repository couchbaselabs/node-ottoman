const chai = require('chai');

const expect = chai.expect;
const ottopath = require('../lib/ottopath');

describe('Ottopath', function() {
  it('should parse correctly', function(done) {
    const input = 'creator.$ref';
    const result = ottopath.parse(input);

    expect(result).to.be.an('array');
    expect(result).to.be.ok;

    expect(result.length).to.be.above(0);

    for (let i = 0; i < result.length; i++) {
      const o = result[i];
      expect(o).to.be.an('object');
      expect(o).to.have.all.keys(['operation', 'expression']);
      expect(o.operation).to.equal('member');
      expect(o.expression.type).to.equal('identifier');
    }

    expect(result[0].expression.value).to.equal('creator');
    expect(result[1].expression.value).to.equal('$ref');

    done();
  });

  it('should stringify', function(done) {
    const input = 'creator.$ref';
    const result = ottopath.parse(input);
    const out = ottopath.stringify(result);

    expect(out).to.equal('creator.$ref');
    done();
  });

  it('stringify should throw Error on bad data', function(done) {
    const input = 'creator.$ref';
    const result = ottopath.parse(input);
    result[0].expression.type = 'totally illegal';

    expect(function() {
      ottopath.stringify(result);
    }).to.throw(Error);
    done();
  });
});
