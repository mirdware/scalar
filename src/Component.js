import {Observer} from './Observer';

let collection = [];
let evtMount = new Event('mount');

export class Component extends Observer {
  constructor(selector, events) {
    super();
    this.events = events || {};
    let elements = document.querySelectorAll(selector);
    for (let i=0, element; element = elements[i]; i++) {
      this.addElement(element);
      let dataBinds = element.querySelectorAll('[data-bind]');
      for(let j=0, bind; bind = dataBinds[j]; j++) {
        bindData(bind, this);
      }
    }
  }

  compose() {
    if (this.elements.length) {
      for (let i=0, element; element = this.elements[i]; i++) {
        bindEvent(element, this.events, this);
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
    for (let i=0, component; component = collection[i]; i++) {
      component.compose();
    }
  }
}

function bindEvent(element, events, component) {
  for (let el in events) {
    let fn = events[el];
    if (typeof fn === 'function') {
      fn = fn.bind(component);
      element.addEventListener(el, fn, true);
      element.dispatchEvent(evtMount);
    } else {
      let elements = element.querySelectorAll(el);
      for(let i=0; el = elements[i]; i++) {
        bindEvent(el, fn, component);
      }
    }
  }
}

function bindData(domElement, obj) {
  let id = obj.id;
  let prop = domElement.getAttribute("data-bind");
  if (!obj[prop]) {
    obj[prop] = new Observer();
  }
  obj[prop].addElement(domElement);
}
