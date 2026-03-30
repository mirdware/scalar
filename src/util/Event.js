import { generateUUID } from './Element';
import { nodeContext } from '../view/Template';

let hasObjectConfig = false;
document.createElement('b')
.addEventListener('load', null, Object.defineProperty({}, 'passive', {
  get() {
    hasObjectConfig = true;
  }
}));

function bindFunction(name, $element, originalFunction) {
  const handler = (e) => {
    let $target = e.target;
    let context;
    while ($target && !$target.dataset?.component) {
      context = nodeContext.get($target);
      if (context) break;
      $target = $target.parentNode;
    }
    return originalFunction.call($element, e, context);
  };
  let capture = false;
  let passive = true;
  let fn = handler;
  if (name.indexOf('_') === 0) {
    fn = (e) => handler(e) !== true && e.preventDefault();
    passive = false;
    name = name.substring(1);
  }
  fn.uuid = originalFunction.uuid;
  const lastChar = name.length - 1;
  if (name.lastIndexOf('_') === lastChar) {
    capture = true;
    name = name.substring(0, lastChar);
  }
  const opt = hasObjectConfig ? { passive, capture } : capture;
  $element.addEventListener(name, fn, opt);
  $element.eventListenerList.push({ name, fn, opt });
}

export function clearEventListeners($node) {
  if ($node.nodeType === 3) return;
  [$node, ...$node.querySelectorAll('*')].forEach(el => {
    if (el.eventListenerList) {
      el.eventListenerList.forEach(item => {
        el.removeEventListener(item.name, item.fn, item.opt);
      });
      delete el.eventListenerList;
    }
  });
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
