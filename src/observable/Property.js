import { isInput, setValue } from '../util/stdlib';
import Template from '../view/Template';
import * as Node from './Node';
import * as Attribute from './Attribute';

const proxies = {};
const getFunctionHandler = (property, root) => ({
  apply: (target, thisArg, argumentsList) => {
    const res = Reflect.apply(target, thisArg, argumentsList);
    set(property, root);
    return res;
  }
});
const getPropertyHandler = (property, binding, root) => ({
  set: (target, prop, value) => {
    root = root || target;
    if (value instanceof Promise) {
      return value.then((data) => {
        if (Reflect.set(target, prop, data)) {
          set(property, root);
        }
      });
    }
    if (Reflect.set(target, prop, value)) {
      return set(property, root);
    }
    return false;
  },
  get: (target, prop, receiver) => {
    let value = Reflect.get(target, prop, receiver);
    if (value) {
      const constructor = value.constructor;
      const { uuid } = property;
      if (constructor === Function && binding) {
        const handler = getFunctionHandler(property, target);
        value = getProxy(uuid, prop, new Proxy(value.bind(target), handler));
      } else if (constructor === Object || constructor === Array) {
        const handler = getPropertyHandler(property, binding, root || target);
        value = value = getProxy(uuid, prop, new Proxy(value, handler));
      }
    }
    return value;
  }
});

function getProxy(uuid, prop, proxyValue) {
  proxies[uuid] = proxies[uuid] || {};
  proxies[uuid][prop] = proxies[uuid][prop] || proxyValue;
  return proxies[uuid][prop];
}

function changeContent(property, value) {
  property.value = value;
  property.attributes.forEach((attr) => Attribute.execute(property, attr, value));
  property.nodes.forEach((node) => Node.execute(property, node, value));
  return true;
}

function getObject(obj, props, value, i = 0) {
  const prop = obj[props[i]];
  obj[props[i]] = ++i < props.length ?
  getObject(prop || {}, props, value, i) :
  value;
  return obj;
}

function setPropertyValue(property, prop, value) {
  if (prop.length) {
    property.value = getObject(property.value || {}, prop, value);
  } else if (value) {
    property.value = value;
  }
}

function isDiferentText($element) {
  for (let i = 0, $child; $child = $element.childNodes[i]; i++) {
    if ($child.nodeType !== 3) return true;
  }
  return false;
}

function evalValue(target) {
  if (target.type === 'radio') {
    return target.checked ? target.value : null;
  }
  if (target.type === 'file' && target.files) {
    return target.files;
  }
  if (target.type === 'checkbox') {
    return target.checked;
  }
  return target.value || null;
}

function config(property, $domElement) {
  if (isInput($domElement)) {
    const value = evalValue($domElement);
    $domElement.addEventListener('keyup', (e) => set(property, e.target.value));
    $domElement.addEventListener('change', (e) => set(property, evalValue(e.target)));
    if (value === null) {
      setValue(property, $domElement, property.value);
    }
    return value;
  }
  if ($domElement.innerHTML) {
    return isDiferentText($domElement) ?
    new Template(property.parent, $domElement) :
    $domElement.innerHTML;
  }
  setValue(property, $domElement, property.value, 'innerHTML');
}

export function addNode(property, $node, prop) {
  let value = config(property, $node);
  let complexType = null;
  if (value instanceof Template) {
    complexType = value;
    value = value.getValue();
  }
  property.nodes.push({ prop, $node, complexType });
  setPropertyValue(property, prop, value);
}

export function get(property) {
  let { value } = property;
  if (typeof value === 'object') {
    if (property.observable !== value) {
      property.proxy = new Proxy(value, getPropertyHandler(property, value instanceof DOMTokenList));
      property.observable = value;
    }
    value = property.proxy;
  }
  return value;
}

export function set(property, value = '') {
  return value instanceof Promise ?
  value.then((data) => changeContent(property, data)) :
  changeContent(property, value);
}

export function addAttribute(property, name, $element, prop) {
  const keys = name.split('.');
  let $attribute = $element;
  name = keys.pop();
  keys.forEach((k) => $attribute = $attribute[k]);
  if ($attribute[name] && !property.value) {
    setPropertyValue(property, prop, $attribute[name]);
  }
  property.attributes.push({ name, $attribute, $element, prop });
}
