function bindFunction(eventName, $element, fn) {
  const method = (e) => fn.bind($element)(e);
  let capture = false;
  if (eventName.indexOf('_') === 0) {
    capture = true;
    eventName = eventName.substring(1);
  }
  method.uuid = fn.uuid;
  $element.addEventListener(eventName, method, capture);
  $element.eventListenerList.push({name: eventName, fn: method});
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

export function setValue($node, value, attr = 'value') {
  const { type } = $node;
  if (type === 'checkbox' || type === 'radio') {
    attr = 'checked';
    if (type === 'radio') {
      value = $node.value === value;
    }
  } else if (type === 'file') {
    attr = 'files';
  }
  if ($node[attr] !== value) $node[attr] = value;
}

export function isInput($node) {
  const nodeName = $node.nodeName;
  return nodeName === 'INPUT' || nodeName === 'TEXTAREA' || nodeName === 'SELECT';
}
