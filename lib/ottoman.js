/*
 Add querying and design doc building.
 Need to set up handling for dealing with non-loaded
    objects so users can't try and use them.
 Add validation support.
 */

var util = require('util');
var uuid = require('node-uuid');
var _ = require('underscore');

var CORETYPES = ['string', 'integer', 'number', 'boolean'];
var INTERNALGIZMO = new Object();

var TYPEALIASES = {
  'String': 'string',
  'Number': 'number',
  'Boolean': 'boolean'
};

// A map of all Ottoman types that have been registered.
var typeList = {};
var queries = [];

/**
 * Returns a ottoman type name by matching the input
 * object against the type descriminators.
 * @param {Object} obx
 * @returns {string}
 */
function typeNameFromObx(obx) {
  for (var i in typeList) {
    if (typeList.hasOwnProperty(i)) {
      var info = typeList[i].prototype.$;

      var matches = true;
      for (var j in info.descrims) {
        if (info.descrims.hasOwnProperty(j)) {
          if (obx[j] != info.descrims[j]) {
            matches = false;
            break;
          }
        }
      }
      if (matches) {
        return info.name;
      }
    }
  }

  return null;
}

/**
 * Determins if an obx object is a ottoman type.
 * @param {Object} obx
 * @returns {boolean}
 */
function isOttoObx(obx) {
  if (obx instanceof Object && typeNameFromObx(obx)) {
    return true;
  }
  return false;
}

var ISO8601REGEX = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[0-1]|0[1-9]|[1-2][0-9])T(2[0-3]|[0-1][0-9]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-](?:2[0-3]|[0-1][0-9]):[0-5][0-9])?$/;
/**
 * Determines if an obx object is a date.
 * @param {Object} obx
 * @returns {boolean}
 */
function isDateObx(obx) {
  if (typeof(obx) === 'string' && obx.match(ISO8601REGEX)) {
    return true;
  }
  return false;
}

/**
 * Determines if an obx object is a reference to another document.
 * @param {Object} obx
 * @returns {boolean}
 */
function isRefObx(obx) {
  if (obx instanceof Object && obx['$ref']) {
    return true;
  }
}

/**
 * Scans through the ottoman type list to identify if this object
 * is an instance of a ottoman type.
 * @param {Object} obj
 * @returns {boolean}
 */
function isOttoObj(obj) {
  for (var i in typeList) {
    if (typeList.hasOwnProperty(i)) {
      if (obj instanceof typeList[i]) {
        return true;
      }
    }
  }
  return false;
}



function obxToObj_Otto_Load(obj, obx, depth, objCache) {
  var info = obj.$;

  if (!(obx instanceof Object)) {
    throw new Error('expected value of type Object');
  }

  // Lets check for sanity sake
  var obxTypeName = typeNameFromObx(obx);
  if (obxTypeName !== obj.$.name) {
    throw new Error('data is wrong type');
  }

  obj.$values = {};
  obj.$loaded = true;
  obj.$initial = obx;

  for (var i in info.schema) {
    if (info.schema.hasOwnProperty(i)) {
      var field = info.schema[i];

      var subtypes = [];
      if (field.subtype) {
        subtypes.push(field.subtype);
      }

      var newObj = obxToObj(obx[field.name], field.type, subtypes, depth+1, objCache, null);
      if (newObj !== undefined) {
        obj.$values[field.name] = newObj;
      }
    }
  }
}

function obxToObj_Otto(obx, typeName, subtypeNames, depth, objCache, thisKey) {
  var type = typeList[typeName];

  if (isRefObx(obx)) {
    var refkey = obx['$ref'][1];

    // Referenced
    if (!(obx instanceof Object)) {
      throw new Error('expected object to be an Object')
    }
    if (obx['$ref'].length !== 2) {
      throw new Error('expected reference object');
    }
    if (obx['$ref'][0] !== typeName) {
      throw new Error('data is wrong type');
    }

    // Check the cache
    var cachedObj = objCache[refkey];
    if (cachedObj) {
      if (cachedObj.$.name !== obx['$ref'][0]) {
        throw new Error('object cached but later found as different type');
      }
      return cachedObj;
    }

    // Create Object
    var obj = createRefObj(refkey, typeName, objCache);
    return obj;
  } else {
    // Embedded
    if (thisKey === undefined) {
      throw new Error('internal: thisKey should be null or a string');
    }

    // Create Object
    var obj = createRefObj(thisKey, typeName, objCache);

    // Populate data
    obxToObj_Otto_Load(obj, obx, depth+1, objCache);
    return obj;
  }
}

function createRefObj(key, typeName, objCache) {
  var type = typeList[typeName];
  if (!type) {
    throw new Error('unknown type ' + typeName);
  }

  var obj = new type(INTERNALGIZMO);
  obj.$key = key;
  obj.$cas = null;
  obj.$cache = objCache;

  // Default as unloaded and blank, this is overwritten immediately
  //   by obxToObj_Otto_Load a lot of the times.
  obj.$values = null;
  obj.$loaded = false;
  obj.$initial = null;

  objCache[key] = obj;
  return obj;
}

function obxToObj_List(obx, typeName, subtypeNames, depth, objCache, thisKey) {
  if (!Array.isArray(obx)) {
    throw new Error('expected array');
  }

  if (!subtypeNames || subtypeNames.length == 0) {
    subtypeNames = ['Mixed'];
  }

  var out = [];
  for (var i = 0; i < obx.length; ++i) {
    var newObj = obxToObj(obx[i], subtypeNames[0], subtypeNames.slice(1), depth+1, objCache, null);
    if (newObj !== undefined) {
      out[i] = newObj;
    }
  }
  return out;
}

function obxToObj_Map(obx, typeName, subtypeNames, depth, objCache, thisKey) {
  if (!(obx instanceof Object)) {
    throw new Error('expected object');
  }

  if (!subtypeNames || subtypeNames.length == 0) {
    subtypeNames = ['Mixed'];
  }

  var out = {};
  for (var i in obx) {
    if (obx.hasOwnProperty(i)) {
      var newObj = obxToObj(obx[i], subtypeNames[0], subtypeNames.slice(1), depth+1, objCache, null);
      if (newObj !== undefined) {
        out[i] = newObj;
      }
    }
  }
  return out;
}

function obxToObj_Date(obx, typeName, subtypeNames, depth, objCache, thisKey) {
  if (typeof(obx) !== 'string') {
    throw new Error('expected string');
  }

  return new Date(obx);
}

function obxToObj_Mixed(obx, typeName, subtypeNames, depth, objCache, thisKey) {
  if (isRefObx(obx)) {
    return obxToObj_Otto(obx, obx['$ref'][0], null, depth, objCache, thisKey);
  } else if (isOttoObx(obx)) {
    var realTypeName = typeNameFromObx(obx);
    return obxToObj_Otto(obx, realTypeName, null, depth, objCache, thisKey);
  } else if (isDateObx(obx)) {
    return obxToObj_Date(obx, 'Date', null, depth, objCache, thisKey);
  } else if (Array.isArray(obx)) {
    return obxToObj_List(obx, 'List', null, depth, objCache, thisKey);
  } else if (obx instanceof Object) {
    return obxToObj_Map(obx, 'Map', null, depth, objCache, thisKey);
  } else {
    return obx;
  }
}

function obxToObj(obx, typeName, subtypeNames, depth, objCache, thisKey) {
  if (!typeName) {
    typeName = 'Mixed';
  }

  if (obx === undefined) {
    return undefined;
  } else if (obx === null) {
    return null;
  }

  if (typeList[typeName]) {
    return obxToObj_Otto(obx, typeName, subtypeNames, depth, objCache, thisKey);
  } else if (typeName === 'Date') {
    return obxToObj_Date(obx, typeName, subtypeNames, depth, objCache, thisKey);
  } else if (typeName === 'List') {
    return obxToObj_List(obx, typeName, subtypeNames, depth, objCache, thisKey);
  } else if (typeName === 'Map') {
    return obxToObj_Map(obx, typeName, subtypeNames, depth, objCache, thisKey);
  } else if (typeName === 'Mixed') {
    return obxToObj_Mixed(obx, typeName, subtypeNames, depth, objCache, thisKey);
  } else if (CORETYPES.indexOf(typeName) >= 0) {
    if (obx instanceof Object) {
      throw new Error('core type is an object');
    }
    return obx;
  } else {
    throw new Error('encountered unknown type ' + typeName);
  }
}






function objToObx_Otto(obj, typeName, subtypeNames, depth, objRefs) {
  if (!(obj instanceof typeList[typeName])) {
    throw new Error('expected object of type ' + typeName);
  }

  if (depth > 0 && !obj.$.embed) {
    // Add to refs array, but only if its not already there.
    if (objRefs.indexOf(obj) < 0) {
      objRefs.push(obj);
    }

    return {'$ref': [obj.$.name, modelKey.call(obj)]};
  } else {
    // Some shortcuts
    var info = obj.$;
    var schema = info.schema;
    var values = obj.$values;

    var out = {};

    // Add schema fields
    for (var i in schema) {
      if (schema.hasOwnProperty(i)) {
        var field = schema[i];
        var subtypes = [];
        if (field.subtype) {
          subtypes.push(field.subtype);
        }

        var outObj = objToObx(values[field.name], field.type, subtypes, depth+1, objRefs);
        if (outObj !== undefined) {
          out[field.name] = outObj;
        }
      }
    }

    // Add descriminators
    for (var i in info.descrims) {
      if (info.descrims.hasOwnProperty(i)) {
        out[i] = info.descrims[i];
      }
    }

    return out;
  }
}

function objToObx_List(obj, typeName, subtypeNames, depth, objRefs) {
  if (!subtypeNames || subtypeNames.length == 0) {
    subtypeNames = ['Mixed'];
  }

  var out = [];
  for (var i = 0; i < obj.length; ++i) {
    var outObj = objToObx(obj[i], subtypeNames[0], subtypeNames.slice(1), depth+1, objRefs);
    if (outObj !== undefined) {
      out[i] = outObj;
    }
  }
  return out;
}

function objToObx_Map(obj, typeName, subtypeNames, depth, objRefs) {
  if (!subtypeNames || subtypeNames.length == 0) {
    subtypeNames = ['Mixed'];
  }

  var out = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      var outObj = objToObx(obj[i], subtypeNames[0], subtypeNames.slice(1), depth+1, objRefs);
      if (outObj !== undefined) {
        out[i] = outObj;
      }
    }
  }
  return out;
}

function objToObx_Date(obj, typeName, subtypeNames, depth, objRefs) {
  if (!(obj instanceof Date)) {
    throw new Error('expected Date object');
  }
  return obj.toJSON();
}

function objToObx_Mixed(obj, typeName, subtypeNames, depth, objRefs) {
  if (isOttoObj(obj)) {
    return objToObx_Otto(obj, obj.$.name, null, depth, objRefs);
  } else if (obj instanceof Date) {
    return objToObx_Date(obj, 'Date', null, depth, objRefs);
  } else if (Array.isArray(obj)) {
    return objToObx_List(obj, 'List', null, depth, objRefs);
  } else if (obj instanceof Object) {
    return objToObx_Map(obj, 'Map', null, depth, objRefs);
  } else {
    return obj;
  }
}

function objToObx(obj, typeName, subtypeNames, depth, objRefs) {
  if (!typeName) {
    typeName = 'Mixed';
  }

  if (obj === undefined) {
    return undefined;
  } else if (obj === null) {
    return null;
  }

  if (typeList[typeName]) {
    return objToObx_Otto(obj, typeName, subtypeNames, depth, objRefs);
  } else if (typeName === 'Date') {
    return objToObx_Date(obj, typeName, subtypeNames, depth, objRefs);
  } else if (typeName === 'List') {
    return objToObx_List(obj, typeName, subtypeNames, depth, objRefs);
  } else if (typeName === 'Map') {
    return objToObx_Map(obj, typeName, subtypeNames, depth, objRefs);
  } else if (typeName === 'Mixed') {
    return objToObx_Mixed(obj, typeName, subtypeNames, depth, objRefs);
  } else if (CORETYPES.indexOf(typeName) >= 0) {
    if (obj instanceof Object) {
      throw new Error('core type is an object');
    }
    return obj;
  } else {
    throw new Error('encountered unknown type ' + typeName);
  }
}

function serialize(obj) {
  return objToObx(obj, obj.$.name, null, 0, []);
}
module.exports.serialize = serialize;







function _buildRefDocName(modelName, obj, options) {
  if (!obj) {
    return null;
  }

  var name = '';

  if (options.keyPrefix) {
    name = options.keyPrefix;
  } else {
    name = modelName;
    for (var i = 0; i < options.key.length; ++i) {
      name += '_' + options.key[i];
    }
  }

  for (var i = 0; i < options.key.length; ++i) {
    if (Array.isArray(obj)) {
      name += '-' + obj[i];
    } else {
      name += '-' + obj[options.key[i]];
    }
  }

  return name;
}

function _saveObj(obj, key, doc, callback) {
  var refDocAdds = [];
  var refDocRemoves = [];

  if (obj.$.refdocs) {
    var refdocs = obj.$.refdocs;
    for (var i = 0; i < refdocs.length; ++i) {
      var newRef = _buildRefDocName(obj.$.name, obj, refdocs[i]);
      var oldRef = _buildRefDocName(obj.$.name, obj.$initial, refdocs[i]);

      if (oldRef !== newRef) {
        refDocAdds.push(newRef);
        if (oldRef) {
          refDocRemoves.push(oldRef);
        }
      }
    }
  }

  var curIdx = 0;
  var stage = 0;

  (function doNext() {
    if (stage === 0) {
      if (curIdx >= refDocAdds.length) {
        curIdx = 0;
        stage = 2;
        return doNext();
      }

      obj.$.bucket.add(refDocAdds[curIdx], key, function(e) {
        if (e) {
          // Begin Rollback
          curIdx--;
          stage = 1;
          return doNext();
        }

        curIdx++;
        return doNext();
      });
    } else if (stage === 1) {
      if (curIdx < 0) {
        curIdx = 0;
        return callback('refdoc conflict');
      }

      obj.$.bucket.remove(refDocAdds[curIdx], function() {
        curIdx--;
        return doNext();
      });
    } else if (stage === 2) {
      obj.$initial = doc;
      obj.$.bucket.set(key, doc, {cas: obj.$cas}, function(){
        stage = 3;
        return doNext();
      });
    } else if (stage === 3) {
      if (curIdx >= refDocRemoves.length) {
        curIdx = 0;
        stage = 4;
        return doNext();
      }

      obj.$.bucket.remove(refDocRemoves[curIdx], function() {
        curIdx++;
        return doNext();
      });
    } else if (stage === 4) {
      return callback();
    }
  })();
}

function save(objs, callback) {
  if (!Array.isArray(objs)) {
    objs = [objs];
  }

  var saved = 0;
  var errors = [];
  var toSave = [];

  for (var i = 0; i < objs.length; ++i) {
    if (!objs[i].$loaded) {
      continue;
    }

    // Do validations
    try {
      modelDoValidation.call(objs[i]);
    } catch(e) {
      return callback(e);
    }

    var key = modelKey.call(objs[i]);
    var doc = objToObx(objs[i], objs[i].$.name, null, 0, objs);

    if (!_.isEqual(objs[i].$initial, doc)) {
      toSave.push([objs[i], key, doc]);
    }
  }

  if (toSave.length > 0) {
    for (var i = 0; i < toSave.length; ++i) {
      var obj = toSave[i][0];
      var key = toSave[i][1];
      var doc = toSave[i][2];

      _saveObj(obj, key, doc, function(e) {
        if (e) {
          errors.push(e);
        }
        saved++;
        if (saved === toSave.length) {
          if (callback) {
            if (errors.length === 0) {
              callback(null);
            } else {
              // TODO: Properly handle errors here
              callback('ERRORS');
            }

          }
        }
      });
    }
  } else {
    // Nothing to save
    callback(null);
  }

}
module.exports.save = save;


function _loadRefs(obj, depthLeft, callback) {
  var refs = [];
  objToObx(obj, obj.$.name, null, 0, refs);

  if (refs.length === 0) {
    callback(null);
    return;
  }

  var loaded = 0;
  for (var i = 0; i < refs.length; ++i) {
    _load(refs[i], depthLeft-1, function(err) {
      loaded++;
      if (loaded >= refs.length) {
        callback(null);
      }
    })
  }
}
function _load(obj, depthLeft, callback) {
  if (depthLeft === 0) {
    callback(null);
    return;
  }

  if (isOttoObj(obj)) {
    if (obj.$loaded) {
      _loadRefs(obj, depthLeft, callback);
    } else {
      var key = modelKey.call(obj);
      obj.$.bucket.get(key, {}, function(err, result) {
        if (err) {
          return callback(err);
        }
        obxToObj_Otto_Load(obj, result.value, 0, obj.$cache, key);
        obj.$cas = result.cas;
        _loadRefs(obj, depthLeft, callback);
      });
    }
  } else if (Array.isArray(obj)) {
    var loaded = 0;
    for (var i = 0; i < obj.length; ++i) {
      _load(obj[i], depthLeft, function(err) {
        loaded++;
        if (loaded === obj.length) {
          // TODO: Only returns last error
          callback(err);
        }
      });
    }
  } else if (obj instanceof Object) {
    var needsLoad = 0;
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        needsLoad++;
        _load(obj[i], depthLeft, function(err) {
          needsLoad--;
          if (needsLoad === 0) {
            // TODO: Only returns last error
            callback(err);
          }
        })
      }
    }
  } else {
    console.warn('attempted to call Load on a core type.');
  }
}
function load(obj, options, callback) {
  if (arguments.length === 2) {
    callback = options;
    options = {};
  }
  if (!options.depth || options.depth < 1) {
    options.depth = 1;
  }

  _load(obj, options.depth, callback);
}
module.exports.load = load;






function modelConstruct(maybeInternal) {
  hideInternals(this);

  this.$key = null;
  this.$values = {};
  this.$cas = null;
  this.$loaded = true;
  this.$initial = undefined;
  this.$cache = undefined;

  if (maybeInternal !== INTERNALGIZMO) {
    // For user-constructed objects, local cache!
    this.$cache = {};

    if (this.$.constructor) {
      this.$constructing = true;
      this.$.constructor.apply(this, arguments);
      delete this.$constructing;
    }

    // Put myself in my own cache.
    var key = modelKey.call(this);
    this.$cache[key] = this;
  }
}

function modelDoValidation() {
  for (var i = 0; i < this.$.required.length; ++i) {
    if (!this[this.$.required[i]]) {
      throw new Error('required field missing: ' + this.$.required[i]);
    }
  }

  for (var i in this.$.schema) {
    if (this.$.schema.hasOwnProperty(i)) {
      var field = this.$.schema[i];
      if (field.validator) {
        field.validator.check(this[i]);
      }
    }
  }
}

function modelKey() {
  if (!this.$key) {
    var key = this.$.name;
    for (var i = 0; i < this.$.id.length; ++i) {
      key += '_' + this[this.$.id[i]];
    }
    this.$key = key.toLowerCase();
  }
  return this.$key;
}

function findModelById() {
  var callback = arguments[arguments.length-1];

  var info = this.prototype.$;

  var key = info.name;
  for (var i = 0; i < info.id.length; ++i) {
    key += '_' + arguments[i];
  }
  key = key.toLowerCase();

  info.bucket.get(key, {}, function(err, result) {
    if (err) {
      return callback(err);
    }

    var obj = obxToObj(result.value, info.name, null, 0, {}, key);
    if (obj.$.name != info.name) {
      throw new Error(obj.$.name + ' is not a ' +  info.name);
    }

    callback(null, obj);
  });
}

module.exports.key = function(obj) {
  return modelKey.call(obj);
};

function findModelByRefDoc(con, refdoc, keys, callback) {
  var info = con.prototype.$;

  var refDocKey = _buildRefDocName(info.name, keys, refdoc);
  info.bucket.get(refDocKey, {}, function(err, result) {
    if (err) {
      return callback(err);
    }

    var docKey = result.value;
    info.bucket.get(docKey, {}, function(err, result) {
      if (err) {
        return callback(err);
      }

      var obj = obxToObj(result.value, info.name, null, 0, {}, docKey);
      if (obj.$.name != info.name) {
        throw new Error(obj.$.name + ' is not a ' +  info.name);
      }

      for (var i = 0; i < refdoc.key.length; ++i) {
        var refField = refdoc.key[i];
        if (obj[refField] !== keys[i]) {
          // This means that the refered document no longer matches up
          //   with the reference that was used to find it...

          // TODO: Proper error here
          return callback('not_found', null);
        }
      }

      callback(null, obj);
    });
  });
}






function registerField(con, field, options) {
  var info = con.prototype.$;

  if (options.required) {
    info.required.push(field);
  }

  var getter = null;
  if (!options.auto) {
    getter = function() {
      return this.$values[options.name];
    };
  } else if(options.auto === 'uuid') {
    getter = function() {
      if (!this.$values[options.name]) {
        this.$values[options.name] = uuid.v4();
      }
      return this.$values[options.name];
    }
  }

  var setter = function(val) {
    if (!options.readonly || this.$constructing) {
      this.$values[options.name] = val;
    } else {
      throw new Error('attempted to set read-only property ' + field);
    }
  };

  Object.defineProperty(con.prototype, field, {
    get: getter,
    set: setter
  });
}

function modelQuery(query, options, callback) {
  var self = this;

  query.bucket.view(query.ddoc, query.view).query({
    key: this.$key,
    limit: query.limit,
    sort: query.sort
  }, function(err, results) {
    if (err) {
      return callback(err);
    }

    var resultObjs = [];
    for (var i = 0; i < results.length; ++i) {
      var obj = createRefObj(results[i].id, query.target, self.$cache);
      resultObjs[i] = obj;
    }

    callback(null, resultObjs);
  });
}

function registerIndexX(con, name, options) {
  var info = con.prototype.$;

  if (options.type === 'refdoc') {
    info.refdocs.push(options);

    con[name] = function() {
      var callback = arguments[arguments.length-1];
      var keys = [];
      for (var i = 0; i < arguments.length - 1; ++i) {
        keys.push(arguments[i]);
      }

      findModelByRefDoc(con, options, keys, callback);
    }
  }
}

/*
 target: 'BlogPost',
 mappedBy: 'creator',
 sort: 'desc',
 limit: 5
 */
function registerQuery(con, name, options) {
  var info = con.prototype.$;

  var query = {};
  query.name = name;
  query.target = options.target;
  query.mappedBy = options.mappedBy;
  query.sort = options.sort ? options.sort : 'desc';
  query.limit = options.limit ? options.limit : 0;
  query.bucket = info.bucket;

  info.queries[name] = query;
  queries.push(query);

  con.prototype[name] = function(options, callback) {
    if (!callback) {
      callback = options;
      options = {};
    }

    modelQuery.call(this, query, options, callback);
  }
}

var indexes = [];

function matchIndex(l, r) {
  if(l.bucket === r.bucket && l.type === r.type) {
    for (var j = 0; j < l.fields.length; ++j) {
      // Stop searching at the end of either field list
      if (j >= r.fields.length) break;

      // No match if a field doesnt match
      if (l.fields[j] !== r.fields[j]) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function registerIndex(bucket, type, fields, options) {
  var newIndex = {
    bucket: bucket,
    type: type,
    fields: fields
  };

  for (var i = 0; i < indexes.length; ++i) {
    var index = indexes[i];

    if (matchIndex(newIndex, index)) {
      if (index.fields.length > fields.length) {
        // If the index is longer, we already have everything we need.
      } else {
        // If the newIndex is longer, use it instead.
        index.fields = fields;
      }

      return;
    }
  }

  indexes.push(newIndex);
}

function getIndexInfo(index) {
  var ddocName = '__ottogen_' + index.type;
  var viewName = 'by';
  for (var i = 0; i < index.fields.length; ++i) {
    viewName += '_' + index.fields[i];
  }

  return [ddocName, viewName];
}

function getIndexView(bucket, type, fields, options) {
  var searchIndex = {
    bucket: bucket,
    type: type,
    fields: fields
  };

  for (var i = 0; i < indexes.length; ++i) {
    var index = indexes[i];

    if (matchIndex(searchIndex, index)) {
      return getIndexInfo(index);
    }
  }

  return false;
}

function buildDesignDocs() {
  // Register all indexes
  for (var i = 0; i < queries.length; ++i) {
    var query = queries[i];
    registerIndex(query.bucket, query.target, [query.mappedBy], {});
  }

  // Assign generated views
  for (var i = 0; i < queries.length; ++i) {
    var query = queries[i];
    var idxIfo = getIndexView(query.bucket, query.target, [query.mappedBy], {});
    query.ddoc = idxIfo[0];
    query.view = idxIfo[1];
  }
}
module.exports.buildDesignDocs = buildDesignDocs;

function registerDesignDocs(callback) {
  // Force an immediate build
  buildDesignDocs();

  var buckets = [];
  var views = [];

  for (var i = 0; i < indexes.length; ++i) {
    var index = indexes[i];
    var idxIfo = getIndexInfo(index);
    var typeInfo = typeList[index.type].prototype.$;

    var viewStrUp = [];
    var viewStrDn = [];

    viewStrUp.push('function(doc,meta) {');
    viewStrDn.push('}');

    for (var j in typeInfo.descrims) {
      if (typeInfo.descrims.hasOwnProperty(j)) {
        viewStrUp.push('if (doc.' + j + ' == \'' + typeInfo.descrims[j] + '\') {');
        viewStrDn.push('}');
      }
    }

    var emitList = [];
    for (var j = 0; j < index.fields.length; ++j) {
      var field = index.fields[j];
      viewStrUp.push('if (doc.'+field+' && doc.'+field+'.$ref) {');
      viewStrDn.push('}');
      emitList.push('doc.' + field + '.$ref[1]');
    }
    if (emitList.length > 1) {
      viewStrUp.push('emit([' + emitList.join(',') + '],null);')
    } else {
      viewStrUp.push('emit(' + emitList[0] + ',null);');
    }

    var viewStr = viewStrUp.join('\n') + '\n';
    viewStr += viewStrDn.reverse().join('\n') + '\n';

    buckets.push(index.bucket);
    views.push({
      bucket: index.bucket,
      ddoc: idxIfo[0],
      name: idxIfo[1],
      data: {map: viewStr}
    });
  }

  var remaining = 0;
  for (var i = 0; i < buckets.length; ++i) {
    var ddocs = {};

    for (var j = 0; j < views.length; ++j) {
      var view = views[j];
      if (view.bucket !== buckets[i]) {
        continue;
      }

      if (!ddocs[view.ddoc]) {
        ddocs[view.ddoc] = {};
      }

      ddocs[view.ddoc][view.name] = view.data;
    }

    for (var j in ddocs) {
      if (ddocs.hasOwnProperty(j)) {
        remaining++;
        buckets[i].setDesignDoc(j, ddocs[j], function(err) {
          remaining--;
          if (remaining === 0) {
            if (err) {
              return callback(err);
            }

            // TODO: only returns the last error
            callback(null);
          }
        });
      }
    }
  }
}
module.exports.registerDesignDocs = registerDesignDocs;

function normalizeSchema(schema) {
  var fieldAliases = {};

  for (var i in schema) {
    if (schema.hasOwnProperty(i)) {
      if (typeof(schema[i]) === 'string' || typeof(schema[i]) === 'function') {
        schema[i] = {
          type: schema[i]
        };
      } else if (typeof(schema[i]) !== 'object') {
        throw new Error('expected schema fields to be strings or objects');
      }

      if (!schema[i].name) {
        schema[i].name = i;
      }

      if (typeof(schema[i].type) === 'function') {
        schema[i].type = schema[i].type.name;
      }

      if (TYPEALIASES[schema[i].type]) {
        schema[i].type = TYPEALIASES[schema[i].type];
      }

      if (schema[i].validator) {
        if (schema[i].validator instanceof Function) {
          schema[i].validator = Validator.custom(schema[i].validator);
        }
        if (!(schema[i].validator instanceof Validator)) {
          throw new Error('validator property must be of type Validator');
        }
      }

      if (fieldAliases[schema[i].name]) {
        throw new Error('multiple fields are assigned the same alias');
      }
      fieldAliases[schema[i].name] = true;

      if (schema[i].auto) {
        // force auto fields to readonly
        schema[i].readonly = true;

        if (schema[i].auto === 'uuid') {
          if (schema[i].type && schema[i].type !== 'string') {
            throw new Error('uuid fields must be string typed');
          }
          schema[i].type = 'string';
        } else {
          throw new Error('unknown auto mode');
        }
      }
    }
  }
}

function validateSchemaIds(ids, schema) {
  for (var i = 0; i < ids.length; ++i) {
    var field = schema[ids[i]];

    if (!field) {
      throw new Error('id specified that is not in the schema');
    }
    if (!field.readonly) {
      throw new Error('id fields must be readonly');
    }

    // Force required on for id fields
    schema[ids[i]].required = true;
  }
}

function registerType(name, type) {
  if (typeList[name]) {
    throw new Error('Type with the name ' + name + ' was already registered');
  }
  typeList[name] = type;
}

function hideInternals(con) {
  var internalFields = ["$key", "$values", "$cas", "$loaded", "$initial", "$cache"];

  for (var i = 0; i < internalFields.length; ++i) {
    Object.defineProperty(con, internalFields[i], {
      enumerable: false,
      writable: true
    });
  }
}

function createModel(name, schema, options) {

  // Create a base function for the model.  This is done so that the
  //   stack traces will have a nice name for developers to identify.

  var con = null;
  eval('con = function ' + name + '() { modelConstruct.apply(this, arguments); }');

  // This is simply to avoid the warning about not using this function
  //   as it is invoked via a string eval above, and never directly.
  if (false) { modelConstruct(); }

  // info object holds all the model-specific data.
  var info = {};
  con.prototype.$ = info;
  Object.defineProperty(con.prototype, "$", {
    enumerable: false,
    writable: true
  });

  // Store some stuff for later!
  info.model = con;
  info.name = name;
  info.schema = schema;
  info.constructor = options.constructor;
  info.bucket = options.bucket;
  info.embed = options.embed;
  info.required = [];
  info.queries = {};
  info.refdocs = [];

  // Build the id list
  // This must happen before schema normalization
  if (options.id) {
    if (!Array.isArray(options.id)) {
      info.id = [options.id];
    } else {
      info.id = options.id;
    }
  } else {
    if (!schema['_id']) {
      schema['_id'] = {auto: 'uuid'};
    }
    info.id = ['_id'];
  }

  if (options.descriminators) {
    if (!(options.descriminators instanceof Object)) {
      throw new Error('descriminators must be an object');
    }
    info.descrims = options.descriminators;
  } else {
    info.descrims = {_type: name};
  }

  // Normalize Schema
  normalizeSchema(schema);
  validateSchemaIds(info.id, schema);

  for (var i in schema) {
    if (schema.hasOwnProperty(i)) {
      registerField(con, i, schema[i]);
    }
  }

  var queries = options.queries;
  if (queries) {
    for (var i in queries) {
      if (queries.hasOwnProperty(i)) {
        registerQuery(con, i, queries[i]);
      }
    }
  }

  var indexes = options.indexes;
  if (indexes) {
    for (var i in indexes) {
      if (indexes.hasOwnProperty(i)) {
        registerIndexX(con, i, indexes[i]);
      }
    }
  }

  con.findById = findModelById;

  // Define the util parser thingy
  con.prototype.inspect = function() {
    var outobj = {};
    if (this.$loaded) {
      for (var i in schema) {
        if (schema.hasOwnProperty(i)) {
          outobj[i] = this[i];
        }
      }
    } else {
      outobj.$key = this.$key;
      outobj.$loaded = this.$loaded;
    }
    return util.inspect(outobj);
  };

  con.prototype.toJSON = function(include_private) {
    var outobj = {};
    if (this.$loaded) {
      for (var i in schema) {
        if (schema.hasOwnProperty(i)) {
          if (include_private || !schema[i].private) {
            outobj[i] = this[i];
          }
        }
      }
    }
    return outobj;
  };

  registerType(name, con);
  return con;
}
module.exports.model = createModel;

function createType(name, schema, options) {
  if (!options) {
    options = {};
  }
  options.embed = true;

  return createModel(name, schema, options);
}
module.exports.type = createType;


function Validator() {
  this.funcs = [];
}
Validator.prototype.check = function(val) {
  for (var i = 0; i < this.funcs.length; ++i) {
    this.funcs[i](val);
  }
};

Validator.prototype.match = function(regexp) {
  return this.custom(function(val) {
    if (!regexp.match(val)) {
      throw new Error('expected value to match ' + regexp);
    }
  });
};
Validator.prototype.in = function(list) {
  return this.custom(function(val) {
    if (list.indexOf(val) < 0) {
      throw new Error('expected value to be in list: ' + list.join(','));
    }
  });
};
Validator.prototype.min = function(min) {
  return this.custom(function(val) {
    if (min !== null && val < min) {
      throw new Error('expected value to not be less than ' + min);
    }
  });
};
Validator.prototype.max = function(max) {
  return this.custom(function(val) {
    if (max !== null && val > max) {
      throw new Error('expected value to not be more than ' + max);
    }
  });
};
Validator.prototype.range = function(min, max) {
  return this.min(min).max(max);
};
Validator.prototype.custom = function(func) {
  this.funcs.push(func);
  return this;
};

Validator.match = function(regexp) {
  return (new Validator()).match(regexp); };
Validator.in = function(list) {
  return (new Validator()).in(list); };
Validator.min = function(min) {
  return (new Validator()).min(min); };
Validator.max = function(max) {
  return (new Validator()).max(max); };
Validator.range = function(min, max) {
  return (new Validator()).range(min, max); };
Validator.custom = function(func) {
  return (new Validator()).custom(func); };

module.exports.Validator = Validator;
