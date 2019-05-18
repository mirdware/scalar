import { Template } from './Template';
import { addListeners, isInput, setValue } from './scUtils';
import { Wrapper } from './Wrapper';
import { ObservableArray } from './ObservableArray';

const privy = new Wrapper();

function changeContent(property, value) {
  const properties = privy.get(property);
  properties.value = value;
  for (let i = 0, listener; listener = property.listeners[i]; i++) {
    listener(property);
  }
  for (let i = 0, node; node = property.nodes[i]; i++) {
    const complexType = properties.complexType;
    let attr = isInput(node) ? 'value': 'innerHTML';
    if (complexType && value && attr === 'innerHTML') {
      node[attr] = complexType.render(value);
      addListeners(properties.parent, node, properties.parent.listen(), false);
      return;
    }
    setValue(property, node, value, attr);
  }
}

export class Property {
  constructor(component) {
    privy.set(this, {parent: component, value: '', observable: {}});
    this.nodes = [];
    this.listeners = [];
  }

  get() {
    const properties = privy.get(this);
    let value = properties.value;
    if (Array.isArray(properties.value)) {
      if (!properties.observable.array) {
        properties.observable = new ObservableArray(this, value);
      }
      value = properties.observable;
    }
    return value;
  }

  set(value) {
    typeof value.then === 'function' ?
      value.then((data) => changeContent(this, data)) :
      changeContent(this, value);
    return this;
  }

  setTemplate(node) {
    privy.get(this).complexType = new Template(node);
    return this;
  }
}
