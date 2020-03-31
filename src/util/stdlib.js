let hasObjectConfig = false;
document.createElement('b')
.addEventListener('load', null, Object.defineProperty({}, 'passive', {
  get() {
    hasObjectConfig = true;
  }
}));

function bindFunction(name, $element, fn) {
  const lastChar = name.length - 1;
  let capture = false;
  let passive = true;
  if (name.indexOf('_') === 0) {
    const method = fn;
    fn = (e) => method.call($element, e) !== true && e.preventDefault();
    fn.uuid = method.uuid;
    passive = false;
    name = name.substring(1);
  }
  if (name.lastIndexOf('_') === lastChar) {
    capture = true;
    name = name.substring(0, lastChar);
  }
  const opt = hasObjectConfig ? { passive, capture } : capture;
  $element.addEventListener(name, fn, opt);
  $element.eventListenerList.push({ name, fn, opt });
}

function getObject(obj, props, value, i = 0) {
  const prop = obj[props[i]];
  obj[props[i]] = ++i < props.length ?
  getObject(prop || {}, props, value, i) :
  value;
  return obj;
}

export function addListeners($element, events, root = true) {
  for (const selector in events) {
    const fn = events[selector];
    if (root && typeof fn === 'function') {
      if (!$element.eventListenerList) {
        $element.eventListenerList = [];
      }
      if (fn.uuid) {
        const search = $element.eventListenerList.find((listener) => listener.fn.uuid === fn.uuid);
        if (!search) {
          bindFunction(selector, $element, fn);
        }
      } else {
        generateUUID(fn);
        bindFunction(selector, $element, fn);
      }
    }
    const $nodeList = $element.querySelectorAll(selector);
    for (let i = 0, $node; $node = $nodeList[i]; i++) {
      addListeners($node, fn);
    }
  }
}

export function clone(object) {
  const gdcc = '_deep_';
  if (object !== Object(object)) return object;
  const set = gdcc in object;
  const cache = object[gdcc];
  let result;
  if (set && typeof cache == 'function') return cache();
  object[gdcc] = () => result;
  if (object instanceof Array) {
    result = object.map((obj) => clone(obj));
  } else {
    result = {};
    for (var prop in object) {
      result[prop] = prop != gdcc ? clone(object[prop]) : clone(cache);
    }
  }
  if (set) {
      object[gdcc] = cache;
  } else {
      delete object[gdcc];
  }
  return result;
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
  property.value = prop.length ?
  getObject(property.value || {}, prop, value) :
  value;
}
