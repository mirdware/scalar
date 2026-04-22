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
const queue = new Map();
let pending;
let computedTracking;

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

export function changeContent(property, value) {
  property.v = value;
  queue.set(property, value);
  if (!pending) {
    pending = 1;
    Promise.resolve().then(() => {
      queue.forEach((value, property) => {
        property.n_.forEach((node) => {
          Node.execute(property, node, value);
        });
        property.a_.forEach((attr) => {
          for (const name in attr) {
            Attribute.execute(property, attr[name], value);
          }
        });
        property.c_.forEach(function(fn){ fn() });
      })
      queue.clear();
      pending = 0;
    });
  }
  return true;
}

export function create(component, name) {
  const privyComponent = Privy.get(component);
  const property = {
    c: component,
    pc: privyComponent,
    v: component[name] ?? '',
    p: new WeakMap(),
    n_: new Map(),
    a_: new Map(),
    c_: new Set(),
    d_: new Set(),
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
        if (Reflect.set(target, prop, value)) {
          return set(property, property.v);
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
          if (typeof value !== 'function') {
            return get(property, value);
          }
          let proxyFn = property.p.get(value);
          if (!proxyFn) {
            proxyFn = new Proxy(value.bind(target), {
              apply: (target, thisArg, argumentsList) => {
                argumentsList = argumentsList.map(arg => proxies.get(arg) || arg);
                const response = Reflect.apply(target, thisArg, argumentsList);
                set(property, property.v);
                return response;
              }
            });
            property.p.set(value, proxyFn);
          }
          return proxyFn;
        }
        return value;
      }
    });
    property.p.set(item, proxy);
    proxies.set(proxy, item);
  }
  return proxy;
}

export function set(property, value) {
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
    property.d_.forEach(function (dep) { dep.c_.delete(property.cb) });
    property.f = value;
    property.v = value = executeComputed();
    property.d_ = deps;
    property.cb = () => changeContent(property, executeComputed());
    deps.forEach(function (dep) { dep.c_.add(property.cb) });
  }
  return changeContent(property, value);
}

export function addNode(property, $node, prop) {
  if (!property.n_.has($node)) {
    property.n_.set($node, Node.create(property, $node, prop));
  }
}

export function addAttribute(property, name, $node, prop, exp) {
  let attributes = property.a_.get($node);
  if (!attributes) {
    attributes = {};
    property.a_.set($node, attributes);
  }
  if (!attributes[name]) {
    attributes[name] = Attribute.create(property, name, $node, prop, exp);
  }
}
