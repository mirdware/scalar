export class ObservableArray {
  constructor(property, array) {
    this.property = property;
    this.array = array;
  }

  push(element) {
    this.array.push(element);
    this.property.set(this.array);
  }

  shift(element) {
    this.array.shift(element);
    this.property.set(this.array);
  }

  unshift(element) {
    this.array.unshift(element);
    this.property.set(this.array);
  }

  pop(element) {
    this.array.pop(element);
    this.property.set(this.array);
  }

  splice(index, length) {
    this.array.splice(index, length);
    this.property.set(this.array);
  }

  map(fn, index) {
    return this.array.map(fn, index);
  }

  forEach(fn, index) {
    this.array.forEach(fn, index);
    this.property.set(this.array);
  }
}
