import * as _ from 'lodash';

function customizer(objValue, srcValue) {
  if (_.isArray(objValue)) {
    return srcValue;
  }
}

const mergeDoc = (dest, source) => {
  return _.mergeWith({}, dest, source, customizer);
};

export { mergeDoc };
