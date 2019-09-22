import { addListeners } from '../util/stdlib';
import * as Privy from '../util/Wrapper';
import * as Property from './Property';

const event = new Event('mount');

function getProperty(component, name) {
  const prop = {
    parent: Privy.get(component),
    value: '',
    nodes: [],
    attributes: []
  };
  Object.defineProperty(component, name, {
    get: () => Property.get(prop),
    set: (value) => Property.set(prop, value)
  });
  return prop;
}

function bindData(component, $domElement) {
  let name = $domElement.getAttribute("data-bind");
  const properties = Privy.get(component).properties;
  const propertyObj = name.split('.');
  name = propertyObj.shift();
  if (!properties[name]) {
    properties[name] = getProperty(component, name);
  }
  Property.addNode(properties[name], $domElement, propertyObj);
}

function bindAttributes(component, $domElement) {
  const attributes = $domElement.getAttribute("data-attr").split(';');
  const properties = Privy.get(component).properties;
  attributes.forEach((attribute) => {
    attribute = attribute.split(':');
    let value = attribute[1].trim();
    const name = attribute[0].trim();
    const propertyObj = value.split('.');
    value = propertyObj.shift();
    if (!properties[value]) {
      properties[value] = getProperty(component, value);
    }
    Property.addAttribute(properties[value], name, $domElement, propertyObj);
  });
}

function watch(component, $node) {
  const dataBinds = Array.from($node.querySelectorAll('[data-bind]'));
  const dataAttributes = Array.from($node.querySelectorAll('[data-attr]'));
  if ($node.getAttribute('data-bind')) {
    dataBinds.push($node);
  }
  if ($node.getAttribute('data-attr')) {
    dataAttributes.push($node);
  }
  dataBinds.forEach(($bind) => bindData(component, $bind));
  dataAttributes.forEach(($attr) => bindAttributes(component, $attr));
}

function getState(state, properties) {
  for (const name in properties) {
    const prop = properties[name].value;
    state[name] = prop instanceof CSSStyleDeclaration ?
    prop.cssText :
    prop instanceof DOMTokenList ?
    prop.value :
    prop;
  }
  return state;
}

export function compose($node, behavioral, module) {
  const props = { $node, module, properties: {} };
  const behavioralIsComponent = behavioral.prototype instanceof Component;
  const component = behavioralIsComponent ? new behavioral() : new Component();
  Privy.set(component, props);
  watch(component, $node);
  props.events = behavioralIsComponent ?
  (component.listen && component.listen()) :
  behavioral(component);
  props.initState = getState({}, props.properties);
  addListeners($node, props.events);
  $node.dispatchEvent(event);
}

export default class Component {
  reset() {
    const { initState } = Privy.get(this);
    for (const name in initState) {
      if (this[name] instanceof DOMTokenList) {
        this[name].value = initState[name];
      } else {
        this[name] = initState[name];
      }
    }
  }

  inject(provider) {
    const { classes, instances } = Privy.get(this).module;
    const { uuid } = provider;
    if (classes[uuid]) {
      provider = new classes[uuid]();
      provider.uuid = uuid;
      instances[uuid] = provider;
      delete classes[uuid];
    }
    return instances[uuid];
  }

  toJSON() {
    const { properties } = Privy.get(this);
    const json = {};
    for (const key in properties) {
      json[key] = properties[key].value;
    }
    return JSON.stringify(json);
  }

  getIndex(e) {
    const { $node } = Privy.get(this);
    let parent = e.target;
    do {
      const key = parent.dataset.key;
      if (key) return key;
      parent = parent.parentNode;
    } while(parent !== $node);
  }
}
