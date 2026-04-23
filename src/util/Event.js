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

function removeListener(listenerList, $node) {
  for (const selector in listenerList) {
    for (const uuid in listenerList[selector]) {
      const listener = listenerList[selector][uuid];
      $node.removeEventListener(listener.name, listener.fn, listener.opt);
    }
  }
}

export function clearEventListeners($node, single) {
  const $nodes = single ? [$node] : [$node, ...$node.querySelectorAll('*')];
  $nodes.forEach(($node) => {
    if ($node[listenerKey]) {
      removeListener($node[listenerKey].p, $node);
      $node[listenerKey].p = {};
      if (!single) {
        removeListener($node[listenerKey]._, $node);
        $node[listenerKey]._ = {};
      }
    }
  });
}

export function addListeners($element, events, isPrivate) {
  const modifier = isPrivate ? '_' : 'p';
  for (const selector in events) {
    let fn = events[selector];
    if (fn instanceof Function) {
      let { uuid } = fn;
      if (!uuid) {
        uuid = generateUUID(fn);
      }
      if (!$element[listenerKey]) {
        $element[listenerKey] = { _: {}, p: {} };
      }
      if (!$element[listenerKey][modifier][selector]) {
        $element[listenerKey][modifier][selector] = {};
      }
      if (!$element[listenerKey][modifier][selector][uuid]) {
        const originalFunction = fn;
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
        let name = selector;
        fn = handler;
        if (name.indexOf('_') === 0) {
          fn = (e) => handler(e) !== true && e.preventDefault();
          passive = false;
          name = name.substring(1);
        }
        const lastChar = name.length - 1;
        if (name.lastIndexOf('_') === lastChar) {
          capture = true;
          name = name.substring(0, lastChar);
        }
        const opt = hasObjectConfig ? { passive, capture } : capture;
        $element.addEventListener(name, fn, opt);
        $element[listenerKey][modifier][selector][uuid] = { name, fn, opt };
      }
    } else {
      const $nodeList = $element.querySelectorAll(selector);
      for (let i = 0, $node; $node = $nodeList[i]; i++) {
        addListeners($node, fn, isPrivate);
      }
    }
  }
}
