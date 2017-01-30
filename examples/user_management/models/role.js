'use strict';

var ottoman = require('./../../../lib/ottoman');

var Role = ottoman.model('Role', {
  name: 'string'
}, {
  idField: 'name'
});

module.exports = Role;
