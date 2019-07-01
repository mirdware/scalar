import { isInput, setValue } from '../util/stdlib';
import Template from '../view/Template';
import Wrapper from '../util/Wrapper';

const privy = new Wrapper();
const getArrayHandler = (property) => ({
  set: (obj, prop, value) => {
    const execution = Reflect.set(obj, prop, value);
    property.set(obj);
    return execution;
  }
});

function changeContent(property, value) {
  const _this = privy.get(property);
  _this.value = value;
  for (let i = 0, listener; listener = property.listeners[i]; i++) {
    listener(property);
  }
  for (let i = 0, node; node = property.nodes[i]; i++) {
    const complexType = _this.complexType;
    const attr = isInput(node) ? 'value': 'innerHTML';
    if (complexType && value && attr === 'innerHTML') {
      return complexType.render(value);
    }
    setValue(property, node, value, attr);
  }
}

export default class Property {
  constructor(component) {
    privy.set(this, {parent: component, value: ''});
    this.nodes = [];
    this.listeners = [];
  }

  get() {
    const _this = privy.get(this);
    let value = _this.value;
    if (Array.isArray(value)) {
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
    return this;
  }

  setTemplate(node) {
    const _this = privy.get(this);
    _this.value = [];
    _this.complexType = new Template(_this.parent, node);
    return this;
  }
}
