import { Observer } from './Reactive';

export class Component extends Observer {
  constructor(selector) {
    super();
    let events = this.bind();
    let elements = document.querySelectorAll(selector);
    for (let i = 0, element; element = elements[i]; i++) {
      this.addElement(element, events);
    }
    this.compose();
  }

  compose() { }

  bind() {
    return {};
  }
}