import { isInput } from '../util/stdlib';
import { escapeHTML } from '../view/Template';
import Wrapper from '../util/Wrapper';

const privy = new Wrapper();
const proxies = [];
const getHandler = (property, root) => ({
  set: (target, prop, value) => {
    root = root || target;
    if (value instanceof Promise) {
      return value.then((data) => {
        if (Reflect.set(target, prop, data)) {
          property.set(root);
        }
      });
    }
    if (Reflect.set(target, prop, value)) {
      return property.set(root);
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

function executeNode(property, value, node) {
  const { $node, complexType } = node;
  const attr = isInput($node) ? 'value': 'innerHTML';
  node.prop.forEach((prop) => value = value[prop]);
  if (complexType && value && attr === 'innerHTML') {
    return complexType.render(value);
  }
  property.setValue($node, value, attr);
}

function changeContent(property, value) {
  const _this = privy.get(property);
  _this.value = value;
  _this.listeners.forEach((listener) => listener(property));
  _this.nodes.forEach((node) => executeNode(property, value, node));
  return true;
}

function getObject(obj, props, value, i = 0) {
  const prop = obj[props[i]];
  obj[props[i]] = ++i < props.length ?
  getObject(prop || {}, props, value, i) :
  value;
  return obj;
}

export default class Property {
  constructor(parent) {
    privy.set(this, {
      value: '',
      nodes: [],
      listeners: []
    });
    this.parent = parent;
  }

  get() {
    const _this = privy.get(this);
    let value = _this.value;
    const constructor = value.constructor;
    if (constructor === Array || constructor === Object) {
      if (_this.observable !== value) {
        _this.proxy = new Proxy(value, getHandler(this));
        _this.observable = value;
      }
      value = _this.proxy;
    }
    return value;
  }

  set(value = '') {
    return value instanceof Promise ?
    value.then((data) => changeContent(this, data)) :
    changeContent(this, value);
  }

  setValue($node, value, attr = 'value') {
    if (attr === 'innerHTML' && typeof value == 'string') {
      value = escapeHTML(value);
    } else if ($node.type === 'checkbox' || $node.type === 'radio') {
      attr = 'checked';
      if ($node.type === 'radio') {
        value = $node.value === this.get();
      }
    } else if ($node.type === 'file') {
      attr = 'files';
    }
    if ($node[attr] !== value) $node[attr] = value;
  }

  addNode(prop, $node, complexType, value) {
    const _this = privy.get(this);
    _this.nodes.push({ prop, $node, complexType });
    if (prop.length) {
      if (!_this.value) {
        _this.value = {};
      }
      getObject(_this.value, prop, value);
    } else if (value) {
      _this.value = value;
    }
  }

  addListener(listener) {
    privy.get(this).listeners.push(listener);
  }
}
