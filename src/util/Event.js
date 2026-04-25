import * as Privy from './Wrapper'
import { nodeContext } from '../view/Template';

let hasObjectConfig = false;
document.createElement('b')
.addEventListener('load', null, Object.defineProperty({}, 'passive', {
  get() {
    hasObjectConfig = true;
  }
}));

function removeListener(listenerList, $node) {
  for (const selector in listenerList) {
    listenerList[selector].forEach((listener) => {
      $node.removeEventListener(listener.name, listener.fn, listener.opt);
    });
  }
}

export function clearEventListeners($node, single) {
  const $nodes = single ? [$node] : [$node, ...$node.querySelectorAll('*')];
  $nodes.forEach(($node) => {
    const eventListeners = Privy.get($node);
    if (eventListeners.p) {
      removeListener(eventListeners.p, $node);
      eventListeners.p = {};
      if (!single) {
        removeListener(eventListeners._, $node);
        eventListeners._ = {};
      }
    }
  });
}

export function addListeners($element, events, isPrivate) {
  const modifier = isPrivate ? '_' : 'p';
  for (const selector in events) {
    let fn = events[selector];
    if (fn instanceof Function) {
      const eventListeners = Privy.get($element);
      if (!eventListeners[modifier]) {
        eventListeners.p = {};
        eventListeners._ = {};
      }
      if (!eventListeners[modifier][selector]) {
        eventListeners[modifier][selector] = new Map();
      }
      if (!eventListeners[modifier][selector].has(fn)) {
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
        eventListeners[modifier][selector].set(originalFunction, { name, fn, opt });
      }
    } else {
      const $nodeList = $element.querySelectorAll(selector);
      for (let i = 0, $node; $node = $nodeList[i]; i++) {
        addListeners($node, fn, isPrivate);
      }
    }
  }
}
