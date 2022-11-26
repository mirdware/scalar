function getObject(obj, props, value, index) {
  obj[props[index]] = ++index < props.length ?
  getObject(obj[props[index]] || {}, props, value, index) :
  value;
  return obj;
}

export function clone(object) {
  if (Array.isArray(object)) {
    return object.map((obj) => clone(obj));
  }
  return Object.assign({}, object);
}

export function generateUUID(obj) {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  .replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  Object.defineProperty(obj, 'uuid', {
    value: uuid,
    configurable: false,
    writable: false
  });
  return uuid;
}

export function setPropertyValue(property, prop, value) {
  property.v = prop.length ?
  getObject(property.v || {}, prop, value, 0) :
  value;
}
