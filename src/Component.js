import { addListeners, isInput, setValue } from './util/Helper';
import Property from './observable/Property';
import Wrapper from './util/Wrapper';

const privy = new Wrapper();

function getProperty(observer, name) {
  const property = new Property(observer);
  Object.defineProperty(observer, name, {
    get: () => property.get(),
    set: (value) => property.set(value)
  });
  return property;
}

function addProperty(domElement, property) {
  if (isInput(domElement)) {
    domElement.addEventListener('keyup', (e) => property.set(e.target.value));
    domElement.addEventListener('change', (e) => property.set(evalValue(e.target)));
    const value = evalValue(domElement);
    if (value !== null) {
      property.set(value);
    } else {
      setValue(property, domElement, property.get());
    }
  } else if (domElement.innerHTML) {
    property.setTemplate(domElement);
  } else {
    setValue(property, domElement, property.get(), 'innerHTML');
  }
  property.nodes.push(domElement);
}

function setAttribute(attribute, key, property) {
  if (property.constructor === Object) {
    for (let k in property) {
      setAttribute(attribute[key], k, property[k]);
    }
  } else if (attribute[key] !== property) {
    attribute[key] = property;
  }
}

function changeProperty(observer, key, attribute, domElement, property) {
  const nodes = privy.get(observer).nodes;
  const eventListenerList = domElement.eventListenerList;
  setAttribute(attribute, key, property);
  if (eventListenerList) {
    while (eventListenerList.length) {
      const listener = eventListenerList.shift();
      domElement.removeEventListener(listener.name, listener.fn, true);
    }
  }
  for (let i = 0, node; node = nodes[i]; i++) {
    addListeners(observer, node, observer.events);
  }
}

function evalValue(target) {
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
  addProperty(domElement, properties[name]);
}

function bindAttributes(observer, domElement) {
  const attributes = domElement.getAttribute("data-attr").split(',');
  const properties = privy.get(observer).properties;
  for (let i = 0, attribute; attribute = attributes[i]; i++) {
    attribute = attribute.split(':');
    const keys = attribute[0].trim().split('.');
    const key = keys.pop();
    const value = attribute[1].trim();
    attribute = domElement;
    keys.forEach((k) => attribute = attribute[k]);
    if (!properties[value]) {
      properties[value] = getProperty(observer, value);
    }
    const property = properties[value];
    const attr = attribute[key];
    if (attr && !(attr instanceof Object) && !property.get()) {
      property.set(attr);
    }
    property.listeners
    .push(() => changeProperty(observer, key, attribute, domElement, property.get()));
  }
}

function watch(observer, node) {
  const dataBinds = Array.from(node.querySelectorAll('[data-bind]'));
  const dataAttributes = Array.from(node.querySelectorAll('[data-attr]'));
  if (node.getAttribute('data-bind')) {
    dataBinds.push(node);
  }
  if (node.getAttribute('data-attr')) {
    dataAttributes.push(node);
  }
  dataBinds.forEach((bind) => bindData(observer, bind));
  dataAttributes.forEach((attr) => bindAttributes(observer, attr));
}

function getState(properties) {
  const state = {};
  for (let name in properties) {
    const property = properties[name].get();
    state[name] =  (property.constructor === Object) ?
      Object.assign({}, property) :
      property;
  }
  return state;
}

export default class Component {
  constructor(node, listener, module) {
    const properties = {
      properties: {},
      nodes: [node]
    };
    privy.set(this, properties);
    watch(this, node);
    properties.initState = getState(properties.properties);
    this.events = listener(module);
    addListeners(this, node, this.events);
  }

  reset() {
    const initState = privy.get(this).initState;
    for (let name in initState) {
      this[name] = initState[name];
    }
  }

  perform(fn) {
    const node = privy.get(this).nodes[0];
    fn(node);
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
