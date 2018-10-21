import { Template } from './Template';
import { addListeners, isInput } from './scUtils';
import { Wrapper } from './Wrapper';

const privy = new Wrapper();

function changeContent(property, value) {
  const privateProperties = privy.get(property);
  privateProperties.value = value;
  for (let i = 0, listener; listener = property.listeners[i]; i++) {
    listener(property);
  }
  for (let i = 0, node; node = property.nodes[i]; i++) {
    const complexType = privateProperties.complexType;
    let attr = isInput(node) ? 'value': 'innerHTML';
    if (complexType && value && attr === 'innerHTML') {
      node[attr] = complexType.render(value);
      addListeners(property, node, privateProperties.events, false);
      return;
    }
    if (node.type === 'file') return;
    if (node.type === 'checkbox' || node.type === 'radio') attr = 'checked';
    if (node.type === 'radio') value = node.value === property.get();
    node[attr] = value;
  }
}

export class Property {
  constructor (events) {
    privy.set(this, {events: events, value: ''});
    this.nodes = [];
    this.listeners = [];
  }

  get() {
    return privy.get(this).value;
  }

  set(value) {
    typeof value.then === 'function' ?
      value.then((data) => changeContent(this, data)) :
      changeContent(this, value);
    return this;
  }

  setTemplate(templateFn) {
    privy.get(this).complexType = new Template(templateFn);
    return this;
  }
}
