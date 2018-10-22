import { Property } from './Property';
import { addListeners, isInput, setValue } from './scUtils';
import { Wrapper } from './Wrapper';

const privy = new Wrapper();

function getProperty(observer, name) {
  const property = new Property(observer);
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
  if (target.type === 'file' && target.files) {
    return target.files;
  }
  if (target.type === 'checkbox') {
    return target.checked;
  }
  return target.value ? target.value : null;
}

function bindData(observer, domElement) {
  const name = domElement.getAttribute("data-bind");
  const properties = privy.get(observer).properties;
  if (!properties[name]) {
    properties[name] = getProperty(observer, name);
  }
  const property = properties[name];
  if (isInput(domElement)) {
    addListeners(observer, domElement, {
      keyup: (e) => property.set(e.target.value),
      change: (e) => property.set(evalValue(e)),
      mount: (e) => {
        const value = evalValue(e);
        if (value !== null) {
          property.set(value);
        } else {
          setValue(property, domElement, property.get());
        }
      }
    });
  }
  property.nodes.push(domElement);
}

function bindAttributes(observer, domElement) {
  const attributes = domElement.getAttribute("data-attr").split(',');
  const properties = privy.get(observer).properties;
  for (let i=0, attribute; attribute = attributes[i]; i++) {
    attribute = attribute.split(':');
    const key = attribute[0].trim();
    const value = attribute[1].trim();
    if (!properties[value]) {
      properties[value] = getProperty(observer, value);
    }
    if (!properties[value].get()) {
      properties[value].set(domElement[key]);
    }
    properties[value].listeners
    .push((property) => {
      const nodes = privy.get(observer).nodes;
      const domClone = domElement.cloneNode(true);
      domClone[key] = property.get();
      domElement.parentNode.replaceChild(domClone, domElement);
      domElement = domClone;
      for (let i = 0, node; node = nodes[i]; i++) {
        addListeners(observer, node, observer.listen());
      }
    });
  }
}

function watch(observer) {
  const nodes = privy.get(observer).nodes;
  for (let i = 0, node; node = nodes[i]; i++) {
    const dataBinds = node.querySelectorAll('[data-bind]');
    const dataAttributes = node.querySelectorAll('[data-attr]');
    for (let j = 0, bind; bind = dataBinds[j]; j++) {
      bindData(observer, bind);
    }
    for (let j = 0, attr; attr = dataAttributes[j]; j++) {
      bindAttributes(observer, attr);
    }
  }
}

function saveInitState(observer) {
  const initState = {};
  const properties = privy.get(observer).properties;
  for (let name in properties) {
    initState[name] = properties[name].get();
  }
  privy.get(observer).initState = initState;
}

export class Component {
  constructor(selector) {
    const properties = {};
    const nodes = document.querySelectorAll(selector);
    privy.set(this, {
      properties: properties,
      nodes: nodes
    });
    watch(this);
    this.init(properties);
    saveInitState(this);
    for (let i = 0, node; node = nodes[i]; i++) {
      addListeners(this, node, this.listen());
    }
  }

  init() {}

  listen() {
    return {};
  }

  reset() {
    const initState = privy.get(this).initState;
    for (let name in initState) {
      this[name] = initState[name];
    }
  }

  perform(fn) {
    const nodes = privy.get(this).nodes;
    for (let i=0, node; node = nodes[i]; i++) {
        fn(node);
    }
  }

  toJSON() {
    const json = {};
    const properties = privy.get(this).properties;
    for (let key in properties) {
      json[key] = properties[key].get();
    }
    return JSON.stringify(json);
  }
}
