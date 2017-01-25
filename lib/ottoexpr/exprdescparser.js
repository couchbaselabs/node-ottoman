'use strict';

var OttoPath = require('./../ottopath/ottopath');
var AndExpr = require('./exprs/andexpr');
var ContainsExpr = require('./exprs/containsexpr');
var ExistsExpr = require('./exprs/existsexpr');
var EqualsExpr = require('./exprs/equalsexpr');
var GreaterExpr = require('./exprs/greaterexpr');
var GreaterEqualsExpr = require('./exprs/greaterequalsexpr');
var LikeExpr = require('./exprs/likeexpr');
var NotExpr = require('./exprs/notexpr');
var OrExpr = require('./exprs/orexpr');
var PathExpr = require('./exprs/pathexpr');

// TODO: DOC NOTES:
//  Ottopath means you need to escape ` in keys
//  Expressions need to escape $ at the start
//

/**
 *
 * @constructor
 * @memberof ottoexpr
 */
function ExprDescParser() {
}

/**
 *
 * @param {OttoPath} path
 * @param {*} desc
 * @returns {?ottoexpr.Expression}
 * @private
 */
ExprDescParser.prototype._parseValue = function(path, desc) {
  if (typeof desc === 'string' ||
    typeof desc === 'number' ||
    typeof desc === 'boolean' ||
    desc === null) {
    return new EqualsExpr(new PathExpr(path), desc);
  } else if (Array.isArray(desc)) {
    throw new Error('unexpected array found in filter expression');
  } else if (desc instanceof Object) {
    if (desc.hasOwnProperty('$or')) {
      var descKeys = Object.keys(desc);
      if (descKeys.length !== 1) {
        throw new Error('filter expression groups containing $and must' +
          'be used exclusively (no other expressions must co-exist).');
      }

      var orList = desc['$or'];
      if (!Array.isArray(orList)) {
        throw new Error('unexpected non-array found in $or filter expression');
      }

      if (orList.length === 0) {
        return null;
      }

      var expr = null;
      for (var i = 0; i < orList.length; ++i) {
        var subExpr = this._parseValue(path, orList[i]);
        if (subExpr) {
          if (expr) {
            expr = new OrExpr(expr, subExpr);
          } else {
            expr = subExpr;
          }
        }
      }
      return expr;
    } else if (desc.hasOwnProperty('$and')) {
      var descKeys = Object.keys(desc);
      if (descKeys.length !== 1) {
        throw new Error('filter expression groups containing $and must' +
          'be used exclusively (no other expressions must co-exist).');
      }

      var andList = desc['$and'];
      if (!Array.isArray(andList)) {
        throw new Error('unexpected non-array found in $and filter expression');
      }

      if (andList.length === 0) {
        return null;
      }

      var expr = null;
      for (var i = 0; i < andList.length; ++i) {
        var subExpr = this._parseValue(path, andList[i]);
        if (subExpr) {
          if (expr) {
            expr = new AndExpr(expr, subExpr);
          } else {
            expr = subExpr;
          }
        }
      }
      return expr;
    } else {
      var expr = null;

      var pushExpr = function(subExpr) {
        if (subExpr) {
          if (expr) {
            expr = new AndExpr(expr, subExpr);
          } else {
            expr = subExpr;
          }
        }
      };

      for (var i in desc) {
        if (desc.hasOwnProperty(i)) {
          if (i.substr(0, 1) === '$') {
            if (i === '$contains') {
              // TODO: This needs to generate a unique key!  Otherwise nested
              //  contains expressions will fail due to name collision.
              var pathKey = 'x';

              var needleDesc = desc['$contains'];
              var needleExpr = this._parseValue(
                OttoPath.parse(pathKey), needleDesc);

              pushExpr(new ContainsExpr(pathKey, new PathExpr(path), needleExpr));
            } else if (i === '$exists') {
              var existsExpr = new ExistsExpr(new PathExpr(path));

              var shouldExist = !!desc['$exists'];
              if (shouldExist) {
                pushExpr(existsExpr);
              } else {
                pushExpr(new NotExpr(existsExpr));
              }
            } else if (i === '$eq') {
              var valueDesc = desc['$eq'];
              pushExpr(new EqualsExpr(
                new PathExpr(path), valueDesc));
            } else if (i === 'gt') {
              var valueDesc = desc['gt'];
              pushExpr(new GreaterExpr(
                new PathExpr(path), valueDesc));
            } else if (i === 'gte') {
              var valueDesc = desc['gte'];
              pushExpr(new GreaterEqualsExpr(
                new PathExpr(path), valueDesc));
            } else if (i === 'lt') {
              var valueDesc = desc['lt'];
              pushExpr(new NotExpr(new GreaterEqualsExpr(
                new PathExpr(path), valueDesc)));
            } else if (i === 'lte') {
              var valueDesc = desc['lte'];
              pushExpr(new NotExpr(new GreaterExpr(
                new PathExpr(path), valueDesc)));
            } else if (i === '$like') {
              var matchString = desc['$like'];
              if (typeof matchString !== 'string') {
                throw new Error('unexpected non-string specified with $like');
              }

              pushExpr(new LikeExpr(new PathExpr(path), matchString));
            } else if (i === '$missing') {
              var existsExpr = new ExistsExpr(new PathExpr(path));

              var shouldBeMissing = !!desc['$missing'];
              if (shouldBeMissing) {
                pushExpr(new NotExpr(existsExpr));
              } else {
                pushExpr(existsExpr);
              }
            } else if (i === '$ne') {
              var valueDesc = desc['$ne'];
              pushExpr(new NotExpr(new EqualsExpr(
                new PathExpr(path), valueDesc)));
            } else if (i === '$not') {
              var notDesc = desc['$not'];
              pushExpr(new NotExpr(this._parseValue(path, notDesc)));
            } else {
              throw new Error('encountered unexpected special key in filter' +
                'expression, use \\$ for application keys starting with $');
            }
          } else {
            var keyPath = null;
            if (i.substr(0, 2) === '\\$') {
              keyPath = OttoPath.parse(i.substr(1));
            } else {
              keyPath = OttoPath.parse(i);
            }

            var fullPath = path.concat(keyPath);
            pushExpr(this._parseValue(fullPath, desc[i]));
          }
        }
      }

      return expr;
    }
  }
};

/**
 *
 * @param desc
 * @returns {?ottoexpr.Expression}
 */
ExprDescParser.prototype.parse = function(desc) {
  var rootPath = OttoPath.parse('');
  return this._parseValue(rootPath, desc);
};

module.exports = ExprDescParser;
