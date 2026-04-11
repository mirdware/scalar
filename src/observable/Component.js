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
const reserved = {undefined: 1, NaN: 1, Infinity: 1};

function getProperty(component, name) {
  const prop = Property.create(component, name);
  Object.defineProperty(component, name, {
    get: () => Property.get(prop),
    set: (value) => Property.set(prop, value, clone(prop.v))
  });
  return prop;
}

function bind($node, name, fn) {
  const $nodes = $node.querySelectorAll('[data-' + name + ']');
  for (let i = 0; i < $nodes.length; i++) fn($nodes[i]);
  if ($node.dataset?.[name]) fn($node);
}

export function watch(component, privyComponent, $node) {
  const privy = privyComponent.p_;
  const noReserved = {};
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
      const exp = prop.replace(/('.*?')|[a-zA-Z_$][\w\.]*/g, (match, group) => {
        if (group) return group;
        const props = match.split('.');
        const name = props.shift();
        if (!reserved[name] && !noReserved[name]) {
          try {
            Function('"use strict";var ' + name);
            const global = globalThis[name];
            if (Object(global) === global) {
              reserved[name] = 1;
            } else {
              noReserved[name] = 1;
            }
          } catch(_) {
            reserved[name] = 1;
          }
        }
        if (reserved[name]) return match;
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
  const tokens = behavioral._providers || [];
  const dependencies = tokens.map(token => module.inject(token));
  const component = behavioralIsComponent ? new behavioral(...dependencies) : new Component();
  Privy.set(component, props);
  props.e_ = behavioralIsComponent ?
  (component.listen && component.listen()) :
  behavioral(component, ...dependencies);
  watch(component, props, $node);
  if (typeof component.onInit === 'function') {
    component.onInit();
  }
  $node.dispatchEvent(new Event('mount'));
  return component;
}

export default class Component {
  /**
   * @deprecated use contructor dependencies instead
   */
  inject(provider) {
    return Privy.get(this).m.inject(provider);
  }

  compose($domElement, behavioral) {
    return compose($domElement, behavioral, Privy.get(this).m);
  }

  /**
   * @deprecated use context parameter instead
   */
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
