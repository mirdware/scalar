const mount = new Event('mount');

export function addListeners(observer, element, events, root = true) {
  for (let selector in events) {
    const fn = events[selector];
    if (root && typeof fn === 'function') {
      element.addEventListener(selector, fn.bind(observer), true);
      element.dispatchEvent(mount);
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
  if (node.type === 'file') return;
  if (node.type === 'checkbox' || node.type === 'radio') attr = 'checked';
  if (node.type === 'radio') value = node.value === property.get();
  node[attr] = value;
}
