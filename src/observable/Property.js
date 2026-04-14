import { clone } from '../util/Element';
import * as Privy from '../util/Wrapper';
import * as Node from './Node';
import * as Attribute from './Attribute';
import { __components__ } from '../Module';
/**
 *
 * @var {property.c} component Referencia al componente que pertence la propiedad
 * @var {property.f} component Función computada para el valor de la propiedad
 * @var {property.c_} computeds Funciones computadas que dependen de la propiedad
 * @var {property.v} value Valor de la propiedad
 * @var {property.n_} nodes Elementos del dom que se controlan mediante la propiedad
 * @var {property.a_} attributes Atributos que controla la propiedad
 * @var {property.o_} overlapings Componentes sobre los que se generan solapamientos
 * @var {property.p} proxy Proxies capturados por la propiedad
 * @var {component.$} $node Elemento base del componente
 * @var {component.m} module Módulo que genero el componente
 * @var {component.p_} properties Propiedades del componente
 * @var {component.e_} events Eventos que debe escuchar el componente
 * @var {component.pc} privateComponent Propiedades privadas del componente
 */
const proxies = new WeakMap();
let computedTracking;

function changeContent(property, value, state) {
  property.v = value;
  property.n_.forEach((node) => {
    Node.execute(node, state, value);
  });
  property.a_.forEach((attr) => {
    Attribute.execute(property, attr, value);
  });
  property.c_?.forEach(function(fn){ fn() });
  return true;
}

function addOverlap(component, property, name) {
  component = Privy.get(component);
  const prop = component.p_[name];
  const events = Object.assign({}, property.pc.e_);
  prop.o_.push(property);
  property.o_.push(prop);
  for (const name in events) {
    if (events[name] instanceof Function) {
      delete events[name];
    }
  }
  Object.assign(component.e_, events);
}

function findComponent(property, $node, name) {
  if ($node.parentNode) {
    const { parentNode } = $node;
    if (parentNode.dataset?.component){
      const uuid = parentNode.dataset.component;
      const component = __components__.get(uuid).c;
      if (component[name]) {
        addOverlap(component, property, name);
      }
    }
    findComponent(property, $node.parentNode, name);
  }
}

export function create(component, name) {
  const privyComponent = Privy.get(component);
  const property = {
    c: component,
    pc: privyComponent,
    v: component[name] ?? '',
    p: new WeakMap(),
    n_: [],
    a_: [],
    o_: []
  };
  findComponent(property, privyComponent.$, name);
  return property;
}

export function get(property, item) {
  if (computedTracking) computedTracking.add(property);
  if (!(item instanceof Object)) return item;
  let proxy = property.p.get(item);
  if (!proxy) {
    proxy = new Proxy(item, {
      set: function (target, prop, value) {
        value = proxies.get(value) || value;
        if (target[prop] === value) return true;
        const state = clone(property.v);
        if (Reflect.set(target, prop, value)) {
          return set(property, property.v, state);
        }
        return false;
      },
      get: function (target, prop, receiver) {
        const { constructor } = target;
        if (constructor && globalThis[constructor.name] === constructor) {
          receiver = target;
        }
        const value = Reflect.get(target, prop, receiver);
        if (value && !computedTracking) {
          if (typeof value === 'function') {
            return  new Proxy(
              value.bind(target), {
                apply: (target, thisArg, argumentsList) => {
                  argumentsList = argumentsList.map(arg => proxies.get(arg) || arg);
                  const state = clone(property.v);
                  const response = Reflect.apply(target, thisArg, argumentsList);
                  set(property, property.v, state);
                  return response;
                }
              }
            );
          }
          return get(property, value);
        }
        return value;
      }
    });
    property.p.set(item, proxy);
    proxies.set(proxy, item);
  }
  return proxy;
}

export function set(property, value, state) {
  property.o_.forEach((prop) => prop.v = value);
  if (typeof value === 'function') {
    const deps = new Set();
    const executeComputed = function () {
      const lastTracking = computedTracking;
      computedTracking = deps;
      try {
        return property.f();
      } finally {
        computedTracking = lastTracking;
      }
    };
    property.f = value;
    property.v = value = executeComputed();
    deps.forEach((dep) => {
      (dep.c_ || (dep.c_ = [])).push(
        () => changeContent(property, executeComputed(), clone(property.v))
      );
    });
  }
  return changeContent(property, value, state);
}

export function addNode(property, $node, prop) {
  if (!property.n_.find((node) => node.$ === $node)) {
    property.n_.push(Node.create(property, $node, prop));
  }
}

export function addAttribute(property, name, $element, prop, exp) {
  property.a_.push(Attribute.create(property, name, $element, prop, exp));
}
