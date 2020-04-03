import { addListeners } from '../util/stdlib';
import * as Privy from '../util/Wrapper';
import * as Property from './Property';

function getProperty(component, name) {
  const prop = Property.create(component, name);
  Object.defineProperty(component, name, {
    get: () => Property.get(prop),
    set: (value) => Property.set(prop, value, Object.assign({}, prop.value))
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
    const properties = [];
    let exp = attribute.substr(index + 1).trim();
    exp.replace(/'[^']*'/g, '').match(/\w[\w\._]+/g)
    .forEach((prop) => {
      const props = prop.split('.');
      const name = props.shift();
      const privy = Privy.get(component).properties;
      if (!privy[name]) {
        privy[name] = getProperty(component, name);
      }
      exp = (exp !== prop) ? exp.replace(prop, 'p.' + prop) : null;
      properties.push({
        props,
        value: privy[name]
      });
    });
    properties.forEach((prop) => {
      Property.addAttribute(prop.value, attribute.substr(0, index).trim(), $domElement, prop.props, exp);
    });
  });
}

function watch(component, $node) {
  const dataBinds = Array.from($node.querySelectorAll('[data-bind]'));
  const dataAttributes = Array.from($node.querySelectorAll('[data-attr]'));
  if ($node.dataset.bind) {
    dataBinds.push($node);
  }
  if ($node.dataset.attr) {
    dataAttributes.push($node);
  }
  dataBinds.forEach(($bind) => {
    bindData(component, $bind);
  });
  dataAttributes.forEach(($attr) => {
    bindAttributes(component, $attr);
  });
}

export function compose($node, behavioral, module) {
  const props = { $node, module, properties: {} };
  const behavioralIsComponent = behavioral.prototype instanceof Component;
  const component = behavioralIsComponent ? new behavioral() : new Component();
  Privy.set(component, props);
  props.events = behavioralIsComponent ?
  (component.listen && component.listen()) :
  behavioral(component);
  watch(component, $node);
  addListeners($node, props.events);
  $node.dispatchEvent(new Event('mount'));
  return component;
}

export default class Component {
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
