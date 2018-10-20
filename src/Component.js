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
  return target.type === 'checkbox' ? target.checked : target.value;
}

function bindData(observer, domElement, events) {
  const name = domElement.getAttribute("data-bind");
  const privateProperties = privy.get(observer);
  if (!privateProperties[name]) {
    privateProperties[name] = getProperty(observer, name, events);
  }
  const property = privateProperties[name];
  if (isInput(domElement)) {
    addListeners(observer, domElement, {
      keyup: (e) => property.set(e.target.value),
      click: (e) => property.set(evalValue(e)),
      mount: (e) => property.set(evalValue(e))
    });
  }
  property.nodes.push(domElement);
}

function watch(observer, nodes) {
  const events = observer.listen();
  for (let i = 0, node; node = nodes[i]; i++) {
    const dataBinds = node.querySelectorAll('[data-bind]');
    for (let j = 0, bind; bind = dataBinds[j]; j++) {
      bindData(observer, bind, events);
    }
    addListeners(observer, node, events);
  }
}

export class Component {
  constructor(selector) {
    const properties = {};
    privy.set(this, properties);
    watch(this, document.querySelectorAll(selector));
    this.init(properties);
  }

  init() {}

  listen() {
    return {};
  }
}