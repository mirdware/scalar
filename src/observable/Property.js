import * as Privy from '../util/Wrapper';
import * as Node from './Node';
import * as Attribute from './Attribute';

const getFunctionHandler = (property, root) => ({
  apply: (target, thisArg, argumentsList) => {
    const res = Reflect.apply(target, thisArg, argumentsList);
    set(property, root);
    return res;
  }
});
const getPropertyHandler = (property, root) => ({
  set: (target, prop, value) => {
    root = root || target;
    if (value instanceof Promise) {
      return value.then((data) => {
        if (Reflect.set(target, prop, data)) return set(property, root);
      });
    }
    if (Reflect.set(target, prop, value)) {
      return set(property, root);
    }
  },
  get: (target, prop, receiver) => {
    const value = Reflect.get(target, prop, receiver);
    if (value) {
      const constructor = value.constructor;
      root = root || target;
      if (constructor === Function) {
        return new Proxy(
          value.bind(target),
          getFunctionHandler(property, root)
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

function changeContent(property, value) {
  property.value = value;
  property.nodes.forEach((node) => Node.execute(node, value));
  property.attributes.forEach((attr) => Attribute.execute(property, attr, value));
  return true;
}

function findComponent($node, components, name) {
  const $childrens = $node.querySelectorAll('[data-component]');
  for (let i = 0, $child; $child = $childrens[i]; i++) {
    const uuid = $child.dataset.component;
    if (components[uuid][name]) {
      return components[uuid];
    }
  }
  return findParentComponent($node, components, name);
}

function findParentComponent($node, components, name) {
  if ($node.parentNode) {
    const parentNode = $node.parentNode;
    if (parentNode.dataset && parentNode.dataset.component){
      const uuid = parentNode.dataset.component;
      if (components[uuid][name]) {
        return components[uuid];
      }
    }
    return findParentComponent($node.parentNode, components, name);
  }
}

function mergeEvents(origin, destination) {
  for (const name in origin) {
    if (!(origin[name] instanceof Function)) {
      destination[name] = origin[name];
    }
  }
}

export function create(component, name) {
  const parent = Privy.get(component);
  const { $node, module, events } = parent;
  const overComponent = findComponent($node, module.components, name);
  let value = '';
  if (overComponent) {
    const componentEvents = Privy.get(overComponent).events;
    mergeEvents(componentEvents, events);
    mergeEvents(events, componentEvents);
    value = overComponent[name];
  }
  return {
    component,
    parent,
    value,
    nodes: [],
    attributes: []
  };
}

export function get(property) {
  const { value } = property;
  if (typeof value === 'object') {
    if (property.observable !== value) {
      property.proxy = new Proxy(
        value,
        getPropertyHandler(property)
      );
      property.observable = value;
    }
    return property.proxy;
  }
  return value;
}

export function set(property, value = '') {
  return value instanceof Promise ?
  value.then((data) => changeContent(property, data)) :
  changeContent(property, value);
}

export function addNode(property, $node, prop) {
  property.nodes.push(Node.create(property, $node, prop, set));
}

export function addAttribute(property, name, $element, prop, exp) {
  property.attributes.push(Attribute.create(property, name, $element, prop, exp));
}
