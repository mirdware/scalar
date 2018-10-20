import { Property } from './Property';
import { addListeners, isInput } from './scUtils';
import { Wrapper } from './Wrapper';

const privy = new Wrapper();

function getProperty(observer, name, events) {
  const property = new Property(events);
  Object.defineProperty(observer, name, {
    get: () => property.get(),
    set: (value) => property.set(value)
  });
  return property;
}

function evalValue(e) {
  const target = e.target;
  if (target.type === 'radio') {
    return target.checked ? target.value : null;
  }
  return target.type === 'checkbox' ? target.checked : target.value;
}

function bindData(observer, domElement, events) {
  const name = domElement.getAttribute("data-bind");
  const privateProperties = privy.get(observer).properties;
  if (!privateProperties[name]) {
    privateProperties[name] = getProperty(observer, name, events);
  }
  const property = privateProperties[name];
  if (isInput(domElement)) {
    addListeners(observer, domElement, {
      keyup: (e) => property.set(e.target.value),
      change: (e) => property.set(evalValue(e)),
      mount: (e) => {
        const value = evalValue(e);
        property.set(value == null ? property.get() : value);
      }
    });
  }
  property.nodes.push(domElement);
}

function watch(observer) {
  const nodes = privy.get(observer).nodes;
  const events = observer.listen();
  for (let i = 0, node; node = nodes[i]; i++) {
    const dataBinds = node.querySelectorAll('[data-bind]');
    addListeners(observer, node, events);
    for (let selector in events) {
      if (typeof events[selector] === 'function') {
        delete events[selector];
      }
    }
    for (let j = 0, bind; bind = dataBinds[j]; j++) {
      bindData(observer, bind, events);
    }
  }
}

export class Component {
  constructor(selector) {
    const properties = {};
    privy.set(this, {
      properties: properties,
      nodes: document.querySelectorAll(selector)
    });
    watch(this);
    this.init(properties);
  }

  init() {}

  listen() {
    return {};
  }

  perform(fn) {
    const nodes = privy.get(this).nodes;
    for (let i=0, node; node = nodes[i]; i++) {
        fn(node);
    }
  }
}