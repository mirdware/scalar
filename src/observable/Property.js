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
 * @var {property.o} observable Valor al que se le realizan las modificaciones
 * @var {property.p} proxy Proxy de value cuando se devuelve un objeto
 * @var {component.$} $node Elemento base del componente
 * @var {component.m} module Módulo que genero el componente
 * @var {component.p_} properties Propiedades del componente
 * @var {component.e_} events Eventos que debe escuchar el componente
 * @var {component.pc} privateComponent Propiedades privadas del componente
 */
let computedTracking;

const getPropertyHandler = (property, root) => ({
  set: (target, prop, value) => {
    root = root || target;
    const state = clone(root);
    if (Reflect.set(target, prop, value)) {
      return set(property, root, state);
    }
    return false;
  },
  get: (target, prop, receiver) => {
    const value = Reflect.get(target, prop, receiver);
    if (value) {
      const constructor = value.constructor;
      root = root || target;
      if (constructor === Function) {
        return new Proxy(
          value.bind(target), {
            apply: (target, thisArg, argumentsList) => {
              const state = clone(root);
              const res = Reflect.apply(target, thisArg, argumentsList);
              !computedTracking && set(property, root, state);
              return res;
            }
          }
        );
      }
      if (constructor === Object || constructor === Array) {
        return new Proxy(
          value,
          getPropertyHandler(property, root)
        );
      }
    }
    return value;
  }
});

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
    n_: [],
    a_: [],
    o_: []
  };
  findComponent(property, privyComponent.$, name);
  return property;
}

export function get(property) {
  if (computedTracking) computedTracking.add(property);
  const value = property.v;
  if (value instanceof Object) {
    if (property.o !== value) {
      property.p = new Proxy(
        value,
        getPropertyHandler(property)
      );
      property.o = value;
    }
    return property.p;
  }
  return value;
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
