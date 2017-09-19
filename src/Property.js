import { Template } from './Template';
import { addListeners } from './Event';

function changeContent(property, value) {
  property.value = value;
  property.nodes.forEach((node) => {
    let attr = node.nodeName === 'INPUT'? 'value': 'innerHTML';
    let complexType = property.complexType;
    if (complexType && attr === 'innerHTML') {
      node[attr] = complexType.render(value);
      addListeners(property, node, property.events);
    } else {
      node[attr] = value;
    }
  });
}

export class Property {
  constructor (events) {
    this.nodes = [];
    this.events = events;
  }

  get() {
    return this.value;
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
