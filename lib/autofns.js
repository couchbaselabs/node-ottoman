var uuid = require('uuid');

function autogenUuid() {
  return uuid.v4();
};

function autogenCounterFn(keyName) {
  // TODO: Implement this...
  return function() {
    throw new Error('Auto counters not supported.')
  }
};

module.exports = {
  uuid: autogenUuid,
  counterFn: autogenCounterFn
};
