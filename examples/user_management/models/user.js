'use strict';

var ottoman = require('./../../../lib/ottoman');
var Role = require('./role');

var User = ottoman.model('User', {
  username: 'string',
  password: 'string',
  email: 'string',
  name: {
    first: 'string',
    last: 'string'
  },
  address: {
    line1: 'string',
    line2: 'string',
    state: 'string',
    country: 'string',
    zip: 'string'
  },
  createdAt: {type: 'Date', default: Date.now},
  passwordReset: {
    token: 'string',
    validUntil: 'Date'
  },
  roles: [Role],
  github: {
    token: 'string'
  }
}, {
  idField: 'username'
});

User.prototype.hasRole = function(role) {
  for (var i = 0; i < this.roles.length; ++i) {
    if (this.roles[i].id() === role) {
      return true;
    }
  }
  return false;
};

module.exports = User;
