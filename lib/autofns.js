var uuid = require('uuid');

/**
 * Generates a UUID for `auto:uuid` fields.
 *
 * @returns {string}
 */
function autogenUuid() {
  return uuid.v4();
};

module.exports = {
  uuid: autogenUuid
};
