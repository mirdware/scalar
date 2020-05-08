let hasObjectConfig = false;
document.createElement('b')
.addEventListener('load', null, Object.defineProperty({}, 'passive', {
  get() {
    hasObjectConfig = true;
  }
}));

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
    if (root && fn instanceof Function) {
      let binding = !$element.eventListenerList;
      if (binding) {
        $element.eventListenerList = [];
      }
      if (!fn.uuid) {
        binding = generateUUID(fn);
      }
      if (binding || !$element.eventListenerList.find((listener) => listener.fn.uuid === fn.uuid)) {
        const lastChar = selector.length - 1;
        let name = selector;
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
    } else {
      const $nodeList = $element.querySelectorAll(selector);
      for (let i = 0, $node; $node = $nodeList[i]; i++) {
        addListeners($node, fn);
      }
    }
  }
}

export function clone(object) {
  if (Array.isArray(object)) {
    return object.map((obj) => obj);
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
  property.value = prop.length ?
  getObject(property.value || {}, prop, value) :
  value;
}
