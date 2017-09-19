import { Property } from './Property';
import { addListeners } from './Event';
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
  nodes.forEach((node) => {
    let dataBinds = node.querySelectorAll('[data-bind]');
    dataBinds.forEach((bind) => bindData(observer, bind, events));
    addListeners(observer, node, events);
  });
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