function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if (key !== "constructor" && key !== "prototype" && key !== "name") {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}

function bindData(component, domElement) {
  let id = component.id;
  let prop = domElement.getAttribute("data-bind");
  if (!component[prop]) {
    component[prop] = new Observer();
  }
  component[prop].addElement(domElement);
}

export class Observer {
  constructor() {
    this.elements = [];
    this.value = '';
  }

  get() {
    return this.value;
  }

  set(value) {
    this.value = value;
    this.elements.forEach((element) => {
      let attr = element.nodeName === 'INPUT'? 'value': 'innerHTML';
      element[attr] = value;
    });
    return this;
  }

  addElement(domElement) {
    this.elements.push(domElement);
    let dataBinds = domElement.querySelectorAll('[data-bind]');
    console.log(dataBinds);
    for(let bind of dataBinds) {
      bindData(this, bind);
    }
    return this;
  }

  setAttribute(name, attr) {
    this.elements.forEach((element) => {
      element[name] = attr;
    });
    return this;
  }

  addClass(ClassName) {
    this.elements.forEach((element) => {
      element.classList.add(ClassName);
    });
    return this;
  }

  removeClass(ClassName) {
    this.elements.forEach((element) => {
      element.classList.remove(ClassName);
    });
    return this;
  }

  toggleClass(ClassName) {
    this.elements.forEach((element) => {
      element.classList.toggle(ClassName);
    });
    return this;
  }

  static mix(mixin) {
    copyProperties(Observer, mixin);
    copyProperties(Observer.prototype, mixin.prototype);
    return Observer;
  }
}
