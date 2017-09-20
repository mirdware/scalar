import { Template } from './Template';
import { addListeners } from './Event';
import { Wrapper } from './Wrapper';

let privy = new Wrapper();

function changeContent(property, value) {
  let privateProperties = privy.get(property);
  privateProperties.value = value;
  for (let i = 0, node; node = property.nodes[i]; i++) {
    let attr = node.nodeName === 'INPUT'? 'value': 'innerHTML';
    let complexType = property.complexType;
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
    value.then?
      value.then((data) => changeContent(this, data)):
      changeContent(this, value);
    return this;
  }

  setTemplate(templateFn) {
    this.complexType = new Template(templateFn);
    return this;
  }
}
