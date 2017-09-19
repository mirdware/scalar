import { Property } from './Property';
import { addListeners } from './Event';

function bindData(observer, domElement, events) {
  let prop = domElement.getAttribute("data-bind");
  if (!observer[prop]) {
    observer[prop] = new Property(events);
  }
  observer[prop].nodes.push(domElement);
}

function watch(observer, nodes) {
  let events = observer.listen();
  nodes.forEach((node) => {
    let dataBinds = node.querySelectorAll('[data-bind]');
    dataBinds.forEach((bind) => bindData(observer, bind, events));
    addListeners(observer, node, events);
  });
}

export class Component {
  constructor(selector) {
    watch(this, document.querySelectorAll(selector));
    this.init();
  }

  init() { }

  listen() {
    return {};
  }
}