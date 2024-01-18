import { clone } from '../util/Element';
import { addListeners } from '../util/Event';
import * as Privy from '../util/Wrapper';
import * as Property from './Property';
/**
 *
 * @var {component.$} $node Elemento HTML asoociado al componente
 * @var {component.m} module Módulo que genero el componente
 * @var {component.pc} privateComponent Propiedades privadas del componente
 * @var {component.p_} properties Propiedades del componente
 * @var {component.e_} events Eventos que seran ejecutados por el componente
 * @var {property.v} value Valor de la propiedad
 *
 */
function getProperty(component, name) {
  const prop = Property.create(component, name);
  Object.defineProperty(component, name, {
    get: () => Property.get(prop),
    set: (value) => Property.set(prop, value, clone(prop.v))
  });
  return prop;
}

function bindData(component, privyComponent, $domElement) {
  let name = $domElement.dataset.bind;
  const properties = privyComponent.p_;
  const propertyObj = name.split('.');
  name = propertyObj.shift();
  if (!properties[name]) {
    properties[name] = getProperty(component, name);
  }
  Property.addNode(properties[name], $domElement, propertyObj);
}

function bindAttributes(component, privyComponent, $domElement) {
  $domElement.dataset.attr.split(';')
  .forEach((attribute) => {
    const index = attribute.indexOf(':');
    const properties = [];
    let exp = attribute.substr(index + 1).trim();
    exp.replace(/'[^']*'/g, '').match(/(^\w[\w\._]+)(?!\${index})/g)
    .forEach((prop) => {
      const props = prop.split('.');
      const name = props.shift();
      const privy = privyComponent.p_;
      if (!privy[name]) {
        privy[name] = getProperty(component, name);
      }
      exp = (exp !== prop) ? exp.replaceAll(prop, 'p.' + prop.replace(/\.([\w_]+)/g, "['$1']")) : null;
      properties.push({
        p_: props,
        v: privy[name]
      });
    });
    properties.forEach((prop) => {
      Property.addAttribute(prop.v, attribute.substr(0, index).trim(), $domElement, prop.p_, exp);
    });
  });
}

export function watch(component, privyComponent, $node) {
  const { dataset } = $node;
  const dataBinds = Array.from($node.querySelectorAll('[data-bind]'));
  const dataAttributes = Array.from($node.querySelectorAll('[data-attr]'));
  if (dataset) {
    if (dataset.bind) dataBinds.push($node);
    if (dataset.attr) dataAttributes.push($node);
  }
  dataBinds.forEach(($bind) => bindData(component, privyComponent, $bind));
  dataAttributes.forEach(($attr) => bindAttributes(component, privyComponent, $attr));
  addListeners($node, privyComponent.e_);
}

export function compose($node, behavioral, module) {
  const props = { $: $node, m: module, p_: {} };
  const behavioralIsComponent = behavioral.prototype instanceof Component;
  const component = behavioralIsComponent ? new behavioral() : new Component();
  Privy.set(component, props);
  props.e_ = behavioralIsComponent ?
  (component.listen && component.listen()) :
  behavioral(component);
  watch(component, props, $node);
  $node.dispatchEvent(new Event('mount'));
  return component;
}

export default class Component {
  inject(provider) {
    return Privy.get(this).m.inject(provider);
  }

  compose($domElement, behavioral) {
    return compose($domElement, behavioral, Privy.get(this).m);
  }

  getIndex(e) {
    const $node = Privy.get(this).$;
    let parent = e.target;
    do {
      const key = parent.dataset.key;
      if (key) return key;
      parent = parent.parentNode;
    } while(parent !== $node);
  }
}
