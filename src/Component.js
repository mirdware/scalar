import {Observer} from './Observer';

let collection = [];
let evtMount = new Event('mount');

function bindEvent(component, element, events) {
  for (let el in events) {
    let fn = events[el];
    if (typeof fn === 'function') {
      fn = fn.bind(component);
      element.addEventListener(el, fn, true);
      element.dispatchEvent(evtMount);
    } else {
      let elements = element.querySelectorAll(el);
      for(let i=0; el = elements[i]; i++) {
        bindEvent(component, el, fn);
      }
    }
  }
}

export class Component extends Observer {
  constructor(selector, events) {
    super();
    this.events = events || {};
    let elements = document.querySelectorAll(selector);
    for (let element of elements) {
      this.addElement(element);
    }
  }

  compose() {
    if (this.elements.length) {
      for (let element of this.elements) {
        bindEvent(this, element, this.events);
      }
    }
  }

  static add(component) {
    if (!(component instanceof Component)) {
      throw 'Not is a instance of Component';
    }
    collection.push(component);
    return Component;
  }

  static execute() {
    for (let component of collection) {
      component.compose();
    }
  }
}
