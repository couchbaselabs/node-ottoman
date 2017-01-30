'use strict';

var User = require('./models/user');

var x = new User();
//console.log(x.fullName);
console.log(JSON.stringify(x));
