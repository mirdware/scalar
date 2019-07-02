function bindFunction(eventName, element, fn) {
  const method = (e) => {
    e.preventDefault();
    return fn.bind(element)(e);
  };
  method.uuid = fn.uuid;
  element.addEventListener(eventName, method, true);
  element.eventListenerList.push({name: eventName, fn: method});
}

export function addListeners(element, events, root = true) {
  for (let selector in events) {
    const fn = events[selector];
    if (root && typeof fn === 'function') {
      if (!element.eventListenerList) {
        element.eventListenerList = [];
      }
      if (fn.uuid) {
        const search = element.eventListenerList.find((listener) => listener.fn.uuid === fn.uuid);
        if (!search) {
          bindFunction(selector, element, fn);
        }
      } else {
        fn.uuid = generateUUID();
        bindFunction(selector, element, fn);
      }
    }
    const nodeList = element.querySelectorAll(selector);
    for (let i = 0, node; node = nodeList[i]; i++) {
      addListeners(node, fn);
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
