export class Observer {
  constructor() {
    this.elements = [];
    this.val = '';
  }

  addElement(domElement) {
    this.elements.push(domElement);
    return this;
  }

  value(newValue) {
    if (newValue) {
      this.val = newValue;
      this.elements.forEach((element) => {
        let attr = element.nodeName === 'INPUT'? 'value': 'innerHTML';
        element[attr] = newValue;
      });
      return this;
    }
    return this.val;
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

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if (key !== "constructor" && key !== "prototype" && key !== "name") {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}