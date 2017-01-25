import { Observer } from './Observer';

let collection = [];
let evtMount = new Event('mount');

function bindEvent(component, element, events) {
  for (let el in events) {
    let fn = events[el];
    if (typeof fn === 'function') {
      element.addEventListener(el, fn.bind(component), true);
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
    let component = this;
    let elements = document.querySelectorAll(selector);
    component.events = events || {};
    for (let i = 0, element; element = elements[i]; i++) {
      component.addElement(element);
    }
  }

  compose() {
    let component = this;
    let elements = component.elements;
    if (elements.length) {
      for (let i = 0, element; element = elements[i]; i++) {
        bindEvent(component, element, component.events);
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
    for (let i = 0, component; component = collection[i]; i++) {
      component.compose();
    }
  }
}
