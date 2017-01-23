'use strict';

/**
 *
 * @private
 */
function _LateConstructToken() {
}

/**
 *
 * @param {*} info
 * @private
 */
function _SchemaInstanceDataCtor(info) {
  var meta = this.$;

  if (meta.ctored) {
    throw new Error('Attempted to invoke SchemaInstance constructor twice');
  }
  meta.ctored = true;

  for (var i in info) {
    if (info.hasOwnProperty(i)) {
      var field = schema.getField(i);
      if (!field) {
        throw new Error('Encountered property `' + i + '` which is not in the schema');
      }
    }
  }

  var LIVE_VALIDATION = true;

  if (LIVE_VALIDATION) {
    meta.values = {};
  }

  schema.forEachField(function(name, field) {
    if (LIVE_VALIDATION) {
      Object.defineProperty(this, name, {
        set: function (newValue) {
          field.validateValue(newValue);
          meta.values[name] = newValue;
        },
        get: function () {
          return meta.values[name];
        },
        configurable: true,
      });
    }

    if (info.hasOwnProperty(name)) {
      this[name] = info[name];
    } else {
      if (field.default !== undefined) {
        if (field.default instanceof Function) {
          this[name] = field.default();
        } else {
          this[name] = field.default;
        }
      }
    }
  }.bind(this));

  schema.forEachField(function(name, field) {
    if (field.required) {
      if (this[name] === undefined || this[name] === null) {
        throw new Error('Property ' + name + ' is a required field');
      }
    }

    if (field.readonly) {
      Object.defineProperty(this, name, {
        writable: false
      });
    }
  }.bind(this));
}

/**
 *
 * @param {Schema} schema
 * @param {*} info
 * @constructor
 */
function SchemaInstance(schema, info) {
  // TODO: To handle subclassing, we probably need to actually do
  //  a search here instead of just assuming its our ctor...

  var meta = this.$ = {};
  Object.defineProperty(this, '$', {
    enumerable: false
  });

  meta.ctored = false;
  meta.schema = schema;

  if (!(info instanceof _LateConstructToken)) {
    _SchemaInstanceDataCtor.call(this, info);
  }
}

/**
 *
 * @param {SchemaInstance} instance
 * @param {*} info
 * @private
 */
SchemaInstance._lateConstruct = function(instance, info) {
  _SchemaInstanceDataCtor.call(instance, info);
};

SchemaInstance._LateConstructToken = _LateConstructToken;

module.exports = SchemaInstance;
