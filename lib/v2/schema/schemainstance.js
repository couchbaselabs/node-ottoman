'use strict';

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

  meta.schema = schema;
  meta.values = {};

  schema.forEachField(function(name, field) {
    if (field.default !== undefined) {
      if (field.default instanceof Function) {
        this[name] = field.default();
      } else {
        this[name] = field.default;
      }
    }

    // TODO: Maybe make `real-time validation` be configurable?
    if (1) {
      meta.values[name] = this[name];
      delete this[name];

      Object.defineProperty(this, name, {
        set: function (newValue) {
          field.validateValue(newValue);
          meta.values[name] = newValue;
        },
        get: function () {
          return meta.values[name];
        },
        configurable: true,
      })
    }
  }.bind(this));

  for (var i in info) {
    if (info.hasOwnProperty(i)) {
      var field = schema.getField(i);
      if (!field) {
        throw new Error('Encountered property `' + i + '` which is not in the schema');
      }

      // TODO: Maybe handle objects/arrays better here?
      this[i] = info[i];
    }
  }

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

module.exports = SchemaInstance;
