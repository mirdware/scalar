import { Observer } from './Reactive';

export class Component extends Observer {
  constructor(selector) {
    super();
    let events = this.listen();
    let elements = document.querySelectorAll(selector);
    elements.forEach((element) => this.addElement(element, events));
    this.init();
  }

  init() { }

  listen() {
    return {};
  }
}