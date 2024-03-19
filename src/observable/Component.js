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

function bind($node, name, fn) {
  const dataBinds = Array.from($node.querySelectorAll('[data-' + name + ']'));
  if ($node.dataset && $node.dataset[name]) {
    dataBinds.push($node);
  }
  dataBinds.forEach(fn);
}

export function watch(component, privyComponent, $node) {
  const privy = privyComponent.p_;
  bind($node, 'bind', ($domElement) => {
    const propertyObj = $domElement.dataset.bind.split('.');
    const name = propertyObj.shift();
    if (!privy[name]) {
      privy[name] = getProperty(component, name);
    }
    Property.addNode(privy[name], $domElement, propertyObj);
  });
  bind($node, 'attr', ($domElement) => {
    $domElement.dataset.attr.split(';').forEach((attribute) => {
      const index = attribute.indexOf(':');
      const properties = [];
      const prop = attribute.substr(index + 1).trim();
      const exp = prop.replace(/(\$\{index\}|'.*?')|\w[\w\.]+/g, (match, group) => {
        if (group) return group;
        const props = match.split('.');
        const name = props.shift();
        if (!privy[name]) {
          privy[name] = getProperty(component, name);
        }
        properties.push({
          p_: props,
          v: privy[name]
        });
        return prop !== match ? 'p.' + match.replace(/\.(\w+)/g, "['$1']") : '';
      });
      properties.forEach((p) => {
        Property.addAttribute(p.v, attribute.substr(0, index).trim(), $domElement, p.p_, exp);
      });
    });
  });
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
