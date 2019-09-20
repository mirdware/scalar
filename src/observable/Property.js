import { isInput, setValue } from '../util/stdlib';
import Template from '../view/Template';
import * as Node from './Node';
import * as Attribute from './Attribute';

const proxies = [];
const getHandler = (property, root) => ({
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
    const obj = target[prop];
    if (obj && obj.constructor === Object) {
      let proxy = proxies.find((p) => p.obj === obj);
      if (!proxy) {
        proxy = { obj, prox: new Proxy(obj, getHandler(property, root || target)) };
        proxies.push(proxy);
      }
      return proxy.prox;
    }
    return Reflect.get(target, prop, receiver);
  }
});

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

function getValue(property, prop, value) {
  if (prop.length) {
    if (!property.value) {
      property.value = {};
    }
    getObject(property.value, prop, value);
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
    return isDiferentText($domElement) ? new Template(property.parent, $domElement) : $domElement.innerHTML;
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
  getValue(property, prop, value);
}

export function get(property) {
  let value = property.value;
  const constructor = value.constructor;
  if (constructor === Array || constructor === Object) {
    if (property.observable !== value) {
      property.proxy = new Proxy(value, getHandler(property));
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
    set(property, $attribute[name]);
  }
  getValue(property, prop, '');
  property.attributes.push({ name, $attribute, $element, prop });
}
