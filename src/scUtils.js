let evtMount = new Event('mount');

export function addListeners(observer, element, events) {
  for (let selector in events) {
    let fn = events[selector];
    if (typeof fn === 'function') {
      element.addEventListener(selector, fn.bind(observer), true);
      setTimeout(() => element.dispatchEvent(evtMount), 1);
    } else {
      let nodeList = element.querySelectorAll(selector);
      for (let i = 0, node; node = nodeList[i]; i++) {
        addListeners(observer, node, fn);
      }
    }
  }
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function isInput(node) {
  const nodeName = node.nodeName;
  return nodeName === 'INPUT' || nodeName === 'TEXTAREA';
}
