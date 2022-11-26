import { generateUUID } from './Element';

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

export function addListeners($element, events) {
  for (const selector in events) {
    const fn = events[selector];
    if (fn instanceof Function) {
      let binding = !$element.eventListenerList;
      if (binding) {
        $element.eventListenerList = [];
      }
      if (!fn.uuid) {
        binding = generateUUID(fn);
      }
      if (binding || !$element.eventListenerList.find((listener) => listener.fn.uuid === fn.uuid)) {
        bindFunction(selector, $element, fn);
      }
    } else {
      const $nodeList = $element.querySelectorAll(selector);
      for (let i = 0, $node; $node = $nodeList[i]; i++) {
        addListeners($node, fn);
      }
    }
  }
}
