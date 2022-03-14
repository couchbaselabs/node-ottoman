export const setValueByPath = <T = Record<string, any>>(object: T, path: string, value: any) => {
  path = path.replace(/[\[]/gm, '.').replace(/[\]]/gm, ''); //to accept [index]
  const keys = path.split('.');
  const last = keys.pop();
  if (!last) {
    return;
  }

  keys.reduce(function (o, k) {
    return (o[k] = o[k] || {});
  }, object)[last] = value;
};
