export class Observer {
  constructor() {
    this.elements = [];
    this.val = '';
  }

  addElement(domElement) {
    this.elements.push(domElement);
  }

  value(newValue) {
    if (newValue) {
      this.val = newValue;
      for (let i=0, element; element = this.elements[i]; i++) {
        let attr = element.nodeName === 'INPUT'? 'value': 'innerHTML';
        element[attr] = newValue;
      }
      return this;
    }
    return this.val;
  }

  addClass(ClassName) {
    for (let i=0, element; element = this.elements[i]; i++) {
      element.classList.add(ClassName);
    }
    return this;
  }

  removeClass(ClassName) {
    for (let i=0, element; element = this.elements[i]; i++) {
      element.classList.remove(ClassName);
    }
    return this;
  }

  toggleClass(ClassName) {
    for (let i=0, element; element = this.elements[i]; i++) {
      element.classList.toggle(ClassName);
    }
    return this;
  }
}
