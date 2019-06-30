import Template from '../view/Template';
import { isInput, setValue } from '../util/Helper';
import Wrapper from '../util/Wrapper';
import Collection from './Collection';

const privy = new Wrapper();

function changeContent(property, value) {
  const _this = privy.get(property);
  if (value instanceof Collection) {
    value = value.array;
  }
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
    privy.set(this, {parent: component, value: '', observable: {}});
    this.nodes = [];
    this.listeners = [];
  }

  get = () => {
    const _this = privy.get(this);
    let value = _this.value;
    if (Array.isArray(value)) {
      if (_this.observable.array !== value) {
        _this.observable = new Collection(this, value);
      }
      value = _this.observable;
    }
    return value;
  };

  set = (value = '') => {
    typeof value.then === 'function' ?
      value.then((data) => changeContent(this, data)) :
      changeContent(this, value);
    return this;
  };

  setTemplate = (node) => {
    const _this = privy.get(this);
    _this.value = [];
    _this.complexType = new Template(_this.parent, node);
    return this;
  };
}
