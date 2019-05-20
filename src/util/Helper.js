import { escapeHTML } from '../view/Template';

function bindFunction(observer, eventName, element, fn) {
  const method = fn.bind(observer);
  method.uuid = fn.uuid;
  element.addEventListener(eventName, method, true);
  element.eventListenerList.push({name: eventName, fn: method});
}

export function addListeners(observer, element, events, root = true) {
  for (let selector in events) {
    const fn = events[selector];
    if (root && typeof fn === 'function') {
      if (!element.eventListenerList) {
        element.eventListenerList = [];
      }
      if (fn.uuid) {
        const search = element.eventListenerList.find((listener) => listener.fn.uuid === fn.uuid);
        if (!search) {
          bindFunction(observer, selector, element, fn);
        }
      } else {
        fn.uuid = generateUUID();
        bindFunction(observer, selector, element, fn);
      }
    }
    const nodeList = element.querySelectorAll(selector);
    for (let i = 0, node; node = nodeList[i]; i++) {
      addListeners(observer, node, fn);
    }
  }
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  .replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function isInput(node) {
  const nodeName = node.nodeName;
  return nodeName === 'INPUT' || nodeName === 'TEXTAREA' || nodeName === 'SELECT';
}

export function setValue(property, node, value, attr = 'value') {
  if (attr === 'innerHTML' && typeof value == 'string') {
    value = escapeHTML(value);
  } else if (node.type === 'checkbox' || node.type === 'radio') {
    attr = 'checked';
    if (node.type === 'radio') {
      value = node.value === property.get();
    }
  } else if (node.type === 'file') {
    attr = 'files';
  }
  if (node[attr] !== value) node[attr] = value;
}
