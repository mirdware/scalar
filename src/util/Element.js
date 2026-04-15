function getObject(obj, props, value, index) {
  const key = props[index];
  obj[key] = ++index < props.length ?
  getObject(obj[key] || (isNaN(props[index]) ? {} : []), props, value, index) :
  value;
  return obj;
}

export function clone(object) {
  if (object instanceof Object) {
    return JSON.parse(JSON.stringify(object));
  }
  return object;
}

export function generateUUID(obj) {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  .replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  Object.defineProperty(obj, 'uuid', { value: uuid });
  return uuid;
}

export function setPropertyValue(property, prop, value) {
  property.v = prop.length ?
  getObject(property.v || {}, prop, value, 0) :
  value;
}

export function getPropertyValue(value, properties) {
  for (let i = 0, prop; prop = properties[i]; i++) {
    if (value == null || value[prop] == null) return '';
    value = value[prop];
  }
  return value;
}
