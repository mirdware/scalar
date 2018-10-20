const evtMount = new Event('mount');

function listen(observer, element, selector, fn) {
  if (typeof fn === 'function') {
    element.addEventListener(selector, fn.bind(observer), true);
    return setTimeout(() => element.dispatchEvent(evtMount), 1);
  }
  const nodeList = element.querySelectorAll(selector);
  for (let i = 0, node; node = nodeList[i]; i++) {
    addListeners(observer, node, fn);
  }
}

export function addListeners(observer, element, events) {
  for (let selector in events) {
    listen(observer, element, selector, events[selector]);
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
  return nodeName === 'INPUT' || nodeName === 'TEXTAREA';
}
