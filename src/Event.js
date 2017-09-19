let evtMount = new Event('mount');

export function addListeners(observer, element, events) {
  for (let el in events) {
    let fn = events[el];
    if (typeof fn === 'function') {
      element.addEventListener(el, fn.bind(observer), true);
      setTimeout(() => element.dispatchEvent(evtMount), 1);
    } else {
      let elements = element.querySelectorAll(el);
      elements.forEach((el) => addListeners(observer, el, fn));
    }
  }
}