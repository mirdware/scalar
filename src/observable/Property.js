import { isInput } from '../util/stdlib';
import Template, { escapeHTML } from '../view/Template';
import Wrapper from '../util/Wrapper';

const privy = new Wrapper();
const getArrayHandler = (property) => ({
  set: (obj, prop, value) => {
    const execution = Reflect.set(obj, prop, value);
    property.set(obj);
    return execution;
  }
});

function executeNode(property, value, node) {
  const attr = isInput(node.node) ? 'value': 'innerHTML';
  node.prop.forEach((prop) => value = value[prop]);
  if (node.complexType && value && attr === 'innerHTML') {
    return node.complexType.render(value);
  }
  property.setValue(node.node, value, attr);
}

function changeContent(property, value) {
  const _this = privy.get(property);
  _this.value = value;
  _this.listeners.forEach((listener) => listener(property));
  _this.nodes.forEach((node) => executeNode(property, value, node));
}

function getObject(obj, property, isTemplate, i = 0) {
  obj[property[i]] = ++i < property.length ?
  getObject({}, property, isTemplate, i) :
  isTemplate ? [] : '';
  return obj;
}

export default class Property {
  constructor(parent) {
    privy.set(this, {
      parent,
      value: '',
      nodes: [],
      listeners: []
    });
  }

  get() {
    const _this = privy.get(this);
    const constructor = _this.value.constructor
    let value = _this.value;
    if (constructor === Array || constructor === Object) {
      if (_this.observable !== value) {
        _this.proxy = new Proxy(value, getArrayHandler(this));
        _this.observable = value;
      }
      value = _this.proxy;
    }
    return value;
  }

  set(value = '') {
    typeof value.then === 'function' ?
      value.then((data) => changeContent(this, data)) :
      changeContent(this, value);
  }

  setValue(node, value, attr = 'value') {
    if (attr === 'innerHTML' && typeof value == 'string') {
      value = escapeHTML(value);
    } else if (node.type === 'checkbox' || node.type === 'radio') {
      attr = 'checked';
      if (node.type === 'radio') {
        value = node.value === this.get();
      }
    } else if (node.type === 'file') {
      attr = 'files';
    }
    if (node[attr] !== value) node[attr] = value;
  }

  getTemplate(element) {
    return new Template(privy.get(this).parent, element);
  }

  addNode(prop, node, complexType) {
    const _this = privy.get(this);
    _this.nodes.push({prop, node, complexType});
    if (prop.length) {
      if (!_this.value) {
        _this.value = {};
      }
      return Object.assign(_this.value, getObject({}, prop, complexType));
    }
    if (complexType) {
      _this.value = [];
    }
  }

  addListener(listener) {
    privy.get(this).listeners.push(listener);
  }
}
