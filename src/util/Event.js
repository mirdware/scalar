import { generateUUID } from './Element';
import { nodeContext } from '../view/Template';

const listenerKey = 'eventListenerList';

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
  return { name, fn, opt };
}

export function clearEventListeners($node, single) {
  const $nodes = single ? [$node] : [$node, ...$node.querySelectorAll('*')];
  $nodes.forEach(($node) => {
    if ($node[listenerKey]) {
      for (const selector in $node[listenerKey]) {
        for (const uuid in $node[listenerKey][selector]) {
          const listener = $node[listenerKey][selector][uuid];
          $node.removeEventListener(listener.name, listener.fn, listener.opt);
        }
      }
      $node[listenerKey] = {};
    }
  });
}

export function addListeners($element, events) {
  for (const selector in events) {
    const fn = events[selector];
    if (fn instanceof Function) {
      let { uuid } = fn;
      if (!uuid) {
        uuid = generateUUID(fn);
      }
      if (!$element[listenerKey]) {
        $element[listenerKey] = {};
      }
      if (!$element[listenerKey][selector]) {
        $element[listenerKey][selector] = {};
      }
      if (!$element[listenerKey][selector][uuid]) {
        $element[listenerKey][selector][uuid] = bindFunction(selector, $element, fn);
      }
    } else {
      const $nodeList = $element.querySelectorAll(selector);
      for (let i = 0, $node; $node = $nodeList[i]; i++) {
        addListeners($node, fn);
      }
    }
  }
}
