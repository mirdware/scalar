import { addListeners } from '../util/stdlib';
import * as Privy from '../util/Wrapper';
import * as Property from './Property';

function getProperty(component, name) {
  const prop = {
    component,
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
  let name = $domElement.dataset.bind;
  const properties = Privy.get(component).properties;
  const propertyObj = name.split('.');
  name = propertyObj.shift();
  if (!properties[name]) {
    properties[name] = getProperty(component, name);
  }
  Property.addNode(properties[name], $domElement, propertyObj);
}

function bindAttributes(component, $domElement) {
  $domElement.dataset.attr.split(';')
  .forEach((attribute) => {
    const index = attribute.indexOf(':');
    const attributes = [];
    let exp = attribute.substr(index + 1).trim();
    exp.replace(/'[^']*'/g, '').match(/\w[\w\._]+/g)
    .forEach((prop) => {
      const propertyObj = prop.split('.');
      const value = propertyObj.shift();
      const properties = Privy.get(component).properties;
      if (!properties[value]) {
        properties[value] = getProperty(component, value);
      }
      const attr = Property.addAttribute(
        properties[value],
        attribute.substr(0, index).trim(),
        $domElement,
        propertyObj,
        exp = (exp !== prop) ? exp.replace(prop, 'p.' + prop) : null
      );
      attributes.push(attr);
    });
    attributes.forEach((attr) => attr.exp && (attr.exp = exp));
  });
}

export function watch(component, $node) {
  const dataBinds = Array.from($node.querySelectorAll('[data-bind]'));
  const dataAttributes = Array.from($node.querySelectorAll('[data-attr]'));
  if ($node.dataset.bind) {
    dataBinds.push($node);
  }
  if ($node.dataset.attr) {
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
  addListeners($node, props.events);
  $node.dispatchEvent(new Event('mount'));
  props.initState = getState({}, props.properties);
  if (behavioralIsComponent) return component;
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
    return Privy.get(this).module.inject(provider);
  }

  compose($domElement, behavioral) {
    return compose($domElement, behavioral, Privy.get(this).module);
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
