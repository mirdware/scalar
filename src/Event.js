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