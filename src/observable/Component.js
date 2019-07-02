import { addListeners, isInput } from '../util/stdlib';
import Property from './Property';
import Wrapper from '../util/Wrapper';
import Template from '../view/Template';

const privy = new Wrapper();
const event = new Event('mount');

function getProperty(observer, name) {
  const property = new Property(observer);
  Object.defineProperty(observer, name, {
    get: () => property.get(),
    set: (value) => property.set(value)
  });
  return property;
}

function isDiferentText(element) {
  for (let i = 0, node; node = element.childNodes[i]; i++) {
    if (node.nodeType !== 3) {
      return true;
    }
  }
  return false;
}

function getValue($domElement, property) {
  if (isInput($domElement)) {
    const value = evalValue($domElement);
    $domElement.addEventListener('keyup', (e) => property.set(e.target.value));
    $domElement.addEventListener('change', (e) => property.set(evalValue(e.target)));
    if (value === null) {
      property.setValue($domElement, property.get());
    }
    return value;
  }
  if ($domElement.innerHTML) {
    return isDiferentText($domElement) ? new Template(property.parent, $domElement) : $domElement.innerHTML;
  }
  property.setValue($domElement, property.get(), 'innerHTML');
}

function addProperty($domElement, property, prop) {
  const value = getValue($domElement, property);
  if (value instanceof Template) {
    property.addNode(prop, $domElement, value, value.getValue());
  } else {
    property.addNode(prop, $domElement, null, value);
  }
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

function changeProperty(observer, key, attribute, $domElement, property) {
  const eventListenerList = $domElement.eventListenerList;
  setAttribute(attribute, key, property);
  while (eventListenerList.length) {
    const listener = eventListenerList.shift();
    $domElement.removeEventListener(listener.name, listener.fn, true);
  }
  addListeners(privy.get(observer).$node, observer.events);
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

function bindData(observer, $domElement) {
  let name = $domElement.getAttribute("data-bind");
  const properties = privy.get(observer).properties;
  const propertyObj = name.split('.');
  name = propertyObj.shift();
  if (!properties[name]) {
    properties[name] = getProperty(observer, name);
  }
  addProperty($domElement, properties[name], propertyObj);
}

function bindAttributes(observer, $domElement) {
  const attributes = $domElement.getAttribute("data-attr").split(',');
  const properties = privy.get(observer).properties;
  attributes.forEach((attribute) => {
    attribute = attribute.split(':');
    const keys = attribute[0].trim().split('.');
    const key = keys.pop();
    const value = attribute[1].trim();
    attribute = $domElement;
    keys.forEach((k) => attribute = attribute[k]);
    if (!properties[value]) {
      properties[value] = getProperty(observer, value);
    }
    const property = properties[value];
    const attr = attribute[key];
    if (attr && !(attr instanceof Object) && !property.get()) {
      property.set(attr);
    }
    property.addListener(
      () => changeProperty(observer, key, attribute, $domElement, property.get())
    );
  });
}

function watch(observer, $node) {
  const dataBinds = Array.from($node.querySelectorAll('[data-bind]'));
  const dataAttributes = Array.from($node.querySelectorAll('[data-attr]'));
  if ($node.getAttribute('data-bind')) {
    dataBinds.push($node);
  }
  if ($node.getAttribute('data-attr')) {
    dataAttributes.push($node);
  }
  dataBinds.forEach(($bind) => bindData(observer, $bind));
  dataAttributes.forEach(($attr) => bindAttributes(observer, $attr));
}

function getState(properties) {
  const state = {};
  for (let name in properties) {
    state[name] = properties[name].get();
  }
  return state;
}

function getPrivateProperties(component, $node, module) {
  const properties = { $node, module, properties: {} };
  privy.set(component, properties);
  watch(component, $node);
  return properties
}

export default class Component {
  constructor($node, listener, module) {
    const props = getPrivateProperties(this, $node, module);
    this.events = listener(this);
    props.initState = getState(props.properties);
    addListeners($node, this.events);
    $node.dispatchEvent(event);
  }

  reset() {
    const _this = privy.get(this);
    const initState = _this.initState;
    for (let name in initState) {
      this[name] = initState[name];
    }
  }

  inject(provider) {
    return privy.get(this).module.inject(provider);
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
