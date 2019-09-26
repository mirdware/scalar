import { isInput, setValue } from '../util/stdlib';
import Template from '../view/Template';
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
  property.attributes.forEach((attr) => Attribute.execute(property, attr, value));
  property.nodes.forEach((node) => Node.execute(node, value));
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
  property.value = prop.length ?
  getObject(property.value || {}, prop, value) :
  value;
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
  let { value } = property;
  if (isInput($domElement)) {
    const inputValue = evalValue($domElement);
    $domElement.addEventListener('keyup', (e) => set(property, e.target.value));
    $domElement.addEventListener('change', (e) => set(property, evalValue(e.target)));
    if (inputValue === null) {
      setValue($domElement, value);
    } else {
      value = inputValue;
    }
  } else if ($domElement.innerHTML) {
    value = isDiferentText($domElement) ?
    new Template(property.parent, $domElement) :
    $domElement.innerHTML;
  } else {
    setValue($domElement, value, 'innerHTML');
  }
  return value;
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
  let value = config(property, $node);
  let complexType = null;
  if (value instanceof Template) {
    complexType = value;
    value = value.getValue();
  }
  setPropertyValue(property, prop, value);
  property.nodes.push({ prop, $node, complexType });
}

export function addAttribute(property, name, $element, prop) {
  const keys = name.split('.');
  let $attribute = $element;
  name = keys.pop();
  keys.forEach((k) => $attribute = $attribute[k]);
  setPropertyValue(property, prop, $attribute[name]);
  property.attributes.push({ name, $attribute, $element, prop });
}
