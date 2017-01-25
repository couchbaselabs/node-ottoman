'use strict';

/**
 *
 * @interface
 */
function Serializer() {
}

/**
 *
 * @param {*} value
 */
Serializer.prototype.serialize = function(value) {

};

/**
 *
 * @param {Ottoman} context
 * @param {*} data
 */
Serializer.prototype.deserialize = function(context, data) {

};

module.exports = Serializer;
