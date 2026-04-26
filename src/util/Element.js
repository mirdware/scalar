function getObject(obj, props, value, index) {
  const key = props[index];
  obj[key] = ++index < props.length ?
  getObject(obj[key] || (isNaN(props[index]) ? {} : []), props, value, index) :
  value;
  return obj;
}

export function setValue(property, prop, value) {
  property.v = prop.length ?
  getObject(property.v || {}, prop, value, 0) :
  value;
}

export function getValue(value, properties) {
  for (let i = 0, prop; prop = properties[i]; i++) {
    if (value == null || value[prop] == null) return '';
    value = value[prop];
  }
  return value;
}
