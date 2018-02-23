import { Property } from './Property';
import { addListeners } from './scUtils';
import { Wrapper } from './Wrapper';

let privy = new Wrapper();

function bindData(observer, domElement, events) {
  let name = domElement.getAttribute("data-bind");
  let privateProperties = privy.get(observer);
  if (!privateProperties[name]) {
    privateProperties[name] = new Property(events);
    Object.defineProperty(observer, name, {
      get: () => privateProperties[name].get(),
      set: (value) => privateProperties[name].set(value)
    });
  }
  privateProperties[name].nodes.push(domElement);
}

function watch(observer, nodes) {
  let events = observer.listen();
  for (let i = 0, node; node = nodes[i]; i++) {
    let dataBinds = node.querySelectorAll('[data-bind]');
    for (let j = 0, bind; bind = dataBinds[j]; j++) {
      bindData(observer, bind, events);
    }
    addListeners(observer, node, events);
  }
}

export class Component {
  constructor(selector) {
    let properties = {};
    privy.set(this, properties);
    watch(this, document.querySelectorAll(selector));
    this.init(properties);
  }

  init() { }

  listen() {
    return {};
  }
}