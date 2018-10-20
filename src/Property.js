import { Template } from './Template';
import { addListeners, isInput } from './scUtils';
import { Wrapper } from './Wrapper';

const privy = new Wrapper();

function changeContent(property, value) {
  const privateProperties = privy.get(property);
  privateProperties.value = value;
  for (let i = 0, node; node = property.nodes[i]; i++) {
    const attr = isInput(node) ? 'value': 'innerHTML';
    const complexType = privateProperties.complexType;
    if (complexType && attr === 'innerHTML') {
      node[attr] = complexType.render(value);
      addListeners(property, node, privateProperties.events);
    } else {
      node[attr] = value;
    }
  }
}

export class Property {
  constructor (events) {
    privy.set(this, {
      events: events,
    });
    this.nodes = [];
  }

  get() {
    return privy.get(this).value;
  }

  set(value) {
    value.then ?
      value.then((data) => changeContent(this, data)) :
      changeContent(this, value);
    return this;
  }

  setTemplate(templateFn) {
    privy.get(this).complexType = new Template(templateFn);
    return this;
  }
}
